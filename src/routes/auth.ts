import express from "express";
import UserDB from "../scheemas/userSchema";
import generateToken from "../util/generateJWT";
import { User } from "../Models/interfaces";
import RefreshToken from "../scheemas/refreshTokenScheema";
import jwt from "jsonwebtoken";
import admin from 'firebase-admin';

const router: express.Router = express.Router();

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
});

const generateTokens = async (userId: string) => {
    // Generate access token.
    let expirationTime = 24 * 60 * 60; // 24 hours in seconds.
    const accessToken = generateToken({ id: userId, refresh: false }, expirationTime);

    // Generate refresh token.
    expirationTime *= 7; // 7 days in seconds.
    const refreshToken = generateToken({ id: userId, refresh: true }, expirationTime, true);
    await RefreshToken.create({ userId: userId, token: refreshToken, expiresAt: new Date(Date.now() + expirationTime * 1000), createdAt: new Date() });

    return { accessToken, refreshToken };
}

router.post('/register', async (req: express.Request, res: express.Response) => {
    const { accountToken, username } = req.body;

    if (!accountToken) return res.status(400).send({ status: "error", message: "No token specified" });
    if (!username) return res.status(400).send({ status: "error", message: "No username specified" });

    try {
        const user = await admin.auth().verifyIdToken(accountToken);
        await admin.auth().updateUser(user.uid, { displayName: username });
        const dbUser = await UserDB.create({ _id: user.uid, username: username, email: user.email || null, phoneNumber: user.phone_number || null, profilePictureURL: user.picture || null });

        const { accessToken, refreshToken } = await generateTokens(dbUser._id);
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
        let dbUser = await UserDB.findById({ _id: user.uid });

        if (!user.displayName && !user.name) return res.status(401).send({ status: "error", message: "User not registered" });
    
        if (!dbUser) {
            // Create new user in database.
            dbUser = await UserDB.create({ _id: user.uid, username: user.displayName || user.name, email: user.email || null, phoneNumber: user.phone_number || null, profilePictureURL: user.picture || null });
        };

        const { accessToken, refreshToken } = await generateTokens(dbUser._id);

        res.status(200).send({ status: "success", message: "User login success", accessToken: accessToken, refreshToken: refreshToken });
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error logging in user"});
    }
});

router.post('/revoke', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send({ status: "error", message: "No token specified" });

    const tokenData: User = jwt.decode(refreshToken) as User;
    if (!tokenData || !tokenData.refresh) return res.status(400).send({ status: "error", message: "Invalid token provided" });

    RefreshToken.findOneAndDelete({ token: refreshToken, userId: tokenData.id }).then((deletedToken) => {
        if (!deletedToken) return res.status(400).send({ status: "error", message: "Invalid token provided"  });

        res.status(200).send({ status: "success", message: "Token revoked" });
    }).catch((err) => {
        console.error(err);
        return res.status(500).send({status: "error", message: "Error revoking token" });
    });
});

router.post('/refreshToken', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send({ status: "error", message: "No token specified" });

    const tokenData: User = jwt.decode(refreshToken) as User;
    if (!tokenData || !tokenData.id || !tokenData.refresh) return res.status(400).send({ status: "error", message: "Invalid token provided" });

    try {
        const deletedToken = await RefreshToken.findOneAndDelete({ token: refreshToken, userId: tokenData.id });
        if (!deletedToken) return res.status(400).send({ status: "error", message: "Invalid token provided" });

        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(tokenData.id);
        res.status(200).send({ status: "success", message: "Token refreshed", newAccessToken: accessToken, refreshToken: newRefreshToken });
    } catch {
        res.status(500).send({ status: "error", message: "Error refreshing token. Please try again." });
    }
});

export default router;