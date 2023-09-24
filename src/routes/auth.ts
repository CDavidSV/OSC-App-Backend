import express from "express";
import UserDB from "../scheemas/userSchema";
import generateToken from "../util/generateJWT";
import refreshTokenSchema from "../scheemas/refreshTokenSchema";
import jwt from "jsonwebtoken";
import { User } from "../Models/interfaces";
import admin from "../config/initFirebase";

const router: express.Router = express.Router();

const generateTokens = (userId: string) => {
    // Generate access token.
    let expirationTime = 24 * 60 * 60; // 24 hours in seconds.
    const accessToken = generateToken({ id: userId } as User, expirationTime);

    // Generate refresh token.
    expirationTime *= 7; // 7 days in seconds.
    const refreshToken = generateToken({ id: userId } as User, expirationTime, true);

    return { accessToken, refreshToken };
}

router.post('/register', async (req: express.Request, res: express.Response) => {
    const { accountToken, username } = req.body;

    if (!accountToken) return res.status(400).send({ status: "error", message: "No token specified" });
    if (!username) return res.status(400).send({ status: "error", message: "No username specified" });

    try {
        const user = await admin.auth().verifyIdToken(accountToken);
        await admin.auth().updateUser(user.uid, { displayName: username });
        const userObject = {
            username: username,
            email: user.email,
            phoneNumber: user.phone_number,
            profilePictureURL: user.picture,
            firebaseId: user.uid,
        };
        
        // Filter out properties that are null or undefined
        const filteredUserObject = Object.fromEntries(
            Object.entries(userObject).filter(([_, value]) => value != null)
        );
        
        // Create the new user in the database
        const dbUser = await UserDB.create(filteredUserObject);

        const { accessToken, refreshToken } = generateTokens(dbUser._id.toString());
        await refreshTokenSchema.create({ userId: dbUser._id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date() });

        res.status(200).send({ status: "success", message: "User registered", accessToken: accessToken, refreshToken: refreshToken });
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error registering user" });
    }
});

router.post('/login', async (req: express.Request, res: express.Response) => {
    const { accountToken } = req.body;

    if (!accountToken) return res.status(400).send({ status: "error", message: "No token specified" });
    
    try {
        const user = await admin.auth().verifyIdToken(accountToken);
        const query: { [key: string]: string | undefined }[] = [{ email: user.email }];

        if (user.phone_number) {
            query.push({ phoneNumber: user.phone_number });
        }

        let dbUser = await UserDB.findOne({ $or: query });
        if (!dbUser) {
            // Create new user in database.
            if (!user.displayName && !user.name) return res.status(401).send({ status: "error", message: "User not registered" });
            const userObject = {
                username: user.displayName || user.name,
                email: user.email,
                phoneNumber: user.phone_number,
                profilePictureURL: user.picture,
                firebaseId: user.uid,
            };
            
            // Filter out properties that are null or undefined
            const filteredUserObject = Object.fromEntries(
                Object.entries(userObject).filter(([, value]) => value != null)
            );
            
            // Create the new user in the database
            dbUser = await UserDB.create(filteredUserObject);
        }

        if (dbUser.firebaseId !== user.uid) {
            // Update new firebase id.
            await UserDB.findByIdAndUpdate(dbUser._id, { firebaseId: user.uid });
        }
        const { accessToken, refreshToken } = generateTokens(dbUser._id.toString());
        await refreshTokenSchema.create({ userId: dbUser._id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date() });

        res.status(200).send({ status: "success", message: "User login success", accessToken: accessToken, refreshToken });
    } catch {
        res.status(500).send({ status: "error", message: "Error logging in user"});
    }
});

router.post('/revoke', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send({ status: "error", message: "No token specified" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY as string, (err: any, tokenData: any) => {
        if (err) return res.sendStatus(401);

        // Remove refresh token from database.
        refreshTokenSchema.findOneAndDelete({ token: refreshToken, userId: tokenData.id }).then((deletedToken) => {  
            if (!deletedToken) return res.status(400).send({ status: "error", message: "Invalid Token Provided" });  
            res.status(200).send({ status: "success", message: "Token revoked" });
        }).catch((err) => {
            return res.status(500).send({status: "error", message: "Error revoking token" });
        });
    });
});

router.post('/refreshToken', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send({ status: "error", message: "No token specified" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY as string, async (err: any, tokenData: any) => {
        if (err) return res.sendStatus(401);

        try {
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenData.id);

            // Update the current refresh token in the database.
            const updatedToken = await refreshTokenSchema.findOneAndUpdate({ token: refreshToken, userId: tokenData.id }, { token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            if (!updatedToken) return res.status(400).send({ status: "error", message: "Invalid Token Provided" });
            res.status(200).send({ status: "success", message: "Token refreshed", newAccessToken: accessToken, refreshToken: newRefreshToken });
        } catch {
            res.status(500).send({ status: "error", message: "Error refreshing token. Please try again." });
        }
    });
});

export default router;