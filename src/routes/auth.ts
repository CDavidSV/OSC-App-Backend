import express from "express";
import twilio from "twilio";
import ClientUser from "../scheemas/clientUserSchema";
import generateToken from "../util/generateJWT";
import { PhoneVerificationCode, User } from "../Models/interfaces";
import generateAuthCode from "../util/generateCode";
import RefreshToken from "../scheemas/refreshTokenScheema";
import { DBUser } from "../Models/database";
import jwt from "jsonwebtoken";

const router: express.Router = express.Router();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const phoneCodes = new Map<string, PhoneVerificationCode>();

const validateContentType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
        res.status(415).send({ message: "Invalid content type for login" });
        return;
    }

    next();
};

router.post('/userLogin', validateContentType, async (req: express.Request, res: express.Response) => {
    const { countryCode, phoneNumber } = req.body;

    // Verify that the request has the required parameters.
    if (!countryCode || !phoneNumber) {
        res.status(400).send({ message: "Invalid credentials" });
        return;
    }

    if (phoneCodes.has(`${countryCode}${phoneNumber}`)) {
        return res.status(400).send({ status: "error", message: "Phone code already sent" });
    }
    
    try {
        // Check that the user exists.
        const user: DBUser | null = await ClientUser.findOne({ phoneNumber: `${countryCode}${phoneNumber}` });
        
        if (!user) {
            return res.status(404).send({ status: "error", message: "User does not exist" });
        }

        // Generate phone code.
        const phoneCode = generateAuthCode(5);
        const fiveMinutesInMs = 300_000;
        phoneCodes.set(`${countryCode}${phoneNumber}`, { code: phoneCode.toString(), userId: user.userId, expiresIn: Date.now() + fiveMinutesInMs });

        // Clear the code after 5 minutes.
        setTimeout(() => {
            phoneCodes.delete(`${countryCode}${phoneNumber}`);
        }, fiveMinutesInMs);

        // Send the verification code to the user's phone number.
        await twilioClient.messages.create({
            from: twilioPhoneNumber,
            to: `${countryCode}${phoneNumber}`,
            body: `Your verification code is: ${phoneCode}`
        });
        res.status(200).send({ status: "success", message: "Verification message sent", expiresIn: "300" });
    } catch {
        res.status(500).send({ status: "error", message: "Error sending verification message" });
    }
});

router.post('/phoneVerification', validateContentType, async (req: express.Request, res: express.Response) => {
    const { phoneNumber, verificationCode } = req.body;
    if (!phoneNumber || !verificationCode) {
        res.status(400).send({ message: "Invalid credentials" });
        return;
    }

    // Validate session id and verification code.
    const phoneCode = phoneCodes.get(phoneNumber);
    if (!phoneCode) {
        res.status(400).send({ status: "error", message: "Invalid phone number" });
        return;
    }
    if (phoneCode.code !== verificationCode) {
        res.status(400).send({ status: "error", message: "Invalid verification code" });
        return;
    }

    try {
        // Generate access token.
        let expirationTime = 24 * 60 * 60; // 24 hours in seconds.
        const accessToken = generateToken({ id: phoneCode.userId, refresh: false }, expirationTime);
        phoneCodes.delete(phoneNumber);

        // Generate refresh token.
        expirationTime *= 7; // 7 days in seconds.
        const refreshToken = generateToken({ id: phoneCode.userId, refresh: true }, expirationTime, true);
        await RefreshToken.create({ userId: phoneCode.userId, token: refreshToken, expiresAt: new Date(Date.now() + expirationTime * 1000), createdAt: new Date() });

        res.status(200).send({ status: "success", message: "Phone number verified", accessToken: accessToken, refreshToken: refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "error", message: "Error generating tokens" });
    }
});

router.post('/revoke', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send({ message: "No token specified" });

    const tokenData: User = jwt.decode(refreshToken) as User;
    if (!tokenData || !tokenData.refresh) return res.status(400).send({ message: "Invalid token" });

    RefreshToken.findOneAndDelete({ token: refreshToken, userId: tokenData.id }).then((deletedToken) => {
        if (!deletedToken) return res.status(400).send({ status: "error", message: "Invalid token provided" });

        res.status(200).send({ status: "success", message: "Token revoked" });
    }).catch((err) => {
        console.error(err);
        return res.status(500).send({status: "error", message: "Error revoking token" });
    });
});

router.post('/refreshToken', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send({ message: "No token specified" });

    const tokenData: User = jwt.decode(refreshToken) as User;
    if (!tokenData || !tokenData.refresh) return res.status(400).send({ message: "Invalid token" });

    try {
        const deletedToken = await RefreshToken.findOneAndDelete({ token: refreshToken, userId: tokenData.id });
        if (!deletedToken) return res.status(400).send({ status: "error", message: "Invalid token provided" });

        let expirationTime = 24 * 60 * 60;
        const accessToken = generateToken({ id: tokenData.id, refresh: false }, expirationTime);

        expirationTime *= 7; // 7 days in seconds.
        const newRefreshToken = generateToken({ id: tokenData.id, refresh: true }, expirationTime, true);
        await RefreshToken.create({ userId: tokenData.id, token: newRefreshToken, expiresAt: new Date(Date.now() + expirationTime * 1000), createdAt: new Date() });

        res.status(200).send({ status: "success", message: "Token refreshed", newAccessToken: accessToken, refreshToken: newRefreshToken });
    } catch {
        res.status(500).send({ status: "error", message: "Error refreshing token. Please try again." });
    }
});

export default router;