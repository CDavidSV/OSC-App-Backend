import express from "express";
import UserDB from "../scheemas/userSchema";
import generateToken from "../util/generateJWT";
import { User } from "../Models/interfaces";
import admin from "../config/initFirebase";

const router: express.Router = express.Router();

const generateTokens = (userId: string) => {
    // Generate access token.
    let expirationTime = 60 * 60 * 24 * 7; // 7 days in seconds.
    const accessToken = generateToken({ id: userId } as User, expirationTime);

    return accessToken;
}

router.post('/register', async (req: express.Request, res: express.Response) => {
    const { accountToken, username } = req.body;

    if (!accountToken) return res.status(400).send({ status: "error", message: "No token specified" });
    if (!username) return res.status(400).send({ status: "error", message: "No username specified" });

    try {
        const user = await admin.auth().verifyIdToken(accountToken);
        await admin.auth().updateUser(user.uid, { displayName: username });
        const dbUser = await UserDB.create({ username: username, email: user.email || null, phoneNumber: user.phone_number || null, profilePictureURL: user.picture || null, firebaseId: user.uid });

        const accessToken = generateTokens(dbUser._id.toString());
        res.status(200).send({ status: "success", message: "User registered", accessToken: accessToken });
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error registering user" });
    }
});

router.post('/login', async (req: express.Request, res: express.Response) => {
    const { accountToken } = req.body;

    if (!accountToken) return res.status(400).send({ status: "error", message: "No token specified" });
    
    try {
        const user = await admin.auth().verifyIdToken(accountToken);
        let dbUser = await UserDB.findOne({ $or: [{ email: user.email }, { phoneNumber: user.phone_number }] });

        if (!dbUser) {
            // Create new user in database.
            if (!user.displayName && !user.name) return res.status(401).send({ status: "error", message: "User not registered" });
            dbUser = await UserDB.create({ username: user.displayName || user.name, email: user.email || null, phoneNumber: user.phone_number || null, profilePictureURL: user.picture || null, firebaseId: user.uid });
        }

        if (dbUser.firebaseId !== user.uid) {
            // Update new firebase id.
            await UserDB.findByIdAndUpdate(dbUser._id, { firebaseId: user.uid });
        }
        const accessToken = generateTokens(dbUser._id.toString());

        res.status(200).send({ status: "success", message: "User login success", accessToken: accessToken });
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error logging in user" });
    }
});

export default router;