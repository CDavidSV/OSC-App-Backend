import express from "express";
import twilio from "twilio";
import ClientUser from "../scheemas/clientUserSchema";
import UserDB from "../scheemas/userSchema";
import generateToken from "../util/generateJWT";
import { User } from "../Models/interfaces";
import generateAuthCode from "../util/generateCode";
import RefreshToken from "../scheemas/refreshTokenScheema";
import { DBUser } from "../Models/database";
import jwt from "jsonwebtoken";
import { isValidPhoneNumber } from 'libphonenumber-js'
import { authenticateAccessToken } from "../middlewares/auth-controller";

interface PhoneVerificationCode {
    userId?: string | undefined;
    code: string;
    expiresIn: number;
    timeout: NodeJS.Timeout;
}

const router: express.Router = express.Router();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const phoneCodes = new Map<string, PhoneVerificationCode>();
const accountCreationCodes = new Map<string, PhoneVerificationCode>();

const validateContentType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
        res.status(415).send({ message: "Invalid content type for login" });
        return;
    }

    next();
};

const sendVerificationCode = async (phoneNumber: string, phoneCode: string) => {
    await twilioClient.messages.create({
        from: twilioPhoneNumber,
        to: phoneNumber,
        body: `Your verification code is: ${phoneCode}`
    });
};

router.post('/startAuth', validateContentType, async (req: express.Request, res: express.Response) => {
    const { countryCode, phoneNumber } = req.body;

    // Verify that the request has the required parameters.
    if (!countryCode || !phoneNumber) {
        res.status(400).send({ staus: "error", message: "Missing parameters", errorCode: 1001 });
        return;
    }

    // Verify that the phone number is valid.
    if (!isValidPhoneNumber(`${countryCode}${phoneNumber}`)) {
        res.status(400).send({ status: "error", message: "Invalid phone number", errorCode: 1002 });
        return;
    }

    try {
        // Check if the user has already requested a verification code.
        const currentPhoneCode = phoneCodes.get(`${countryCode}${phoneNumber}`) || accountCreationCodes.get(`${countryCode}${phoneNumber}`);
        if (currentPhoneCode) {
            await sendVerificationCode(`${countryCode}${phoneNumber}`, currentPhoneCode.code);
            return res.status(200).send({ status: "success", message: "Verification message sent", expiresIn: currentPhoneCode.expiresIn.toString() });
        }

        const user: DBUser | null = await ClientUser.findOne({ phoneNumber: `${countryCode}${phoneNumber}` });

        // Generate phone code.
        const phoneCode = generateAuthCode(5);
        const fiveMinutesInMs = 300_000;
        const expirationTime = Date.now() + fiveMinutesInMs;
        const timeout = setTimeout(() => {
            phoneCodes.delete(`${countryCode}${phoneNumber}`);
        }, fiveMinutesInMs);

        // Check that the user exists.
        if (!user) {
            accountCreationCodes.set(`${countryCode}${phoneNumber}`, { code: phoneCode.toString(), expiresIn: expirationTime, timeout });

            // Send the verification code to the user's phone number.
            await sendVerificationCode(`${countryCode}${phoneNumber}`, phoneCode);
            res.status(200).send({ status: "success", message: "Verification message sent", expiresIn: expirationTime.toString(), newUser: true });
            return;
        }

        phoneCodes.set(`${countryCode}${phoneNumber}`, { code: phoneCode.toString(), userId: user.userId, expiresIn: expirationTime, timeout});

        // Send the verification code to the user's phone number.
        await sendVerificationCode(`${countryCode}${phoneNumber}`, phoneCode);

        res.status(200).send({ status: "success", message: "Verification message sent", expiresIn: expirationTime.toString(), newUser: false });
    } catch {
        res.status(500).send({ status: "error", message: "Error sending verification message", errorCode: 1003 });
    }
    
});

router.post('/verifyOTP', validateContentType, async (req: express.Request, res: express.Response) => {
    const { phoneNumber, verificationCode } = req.body;
    if (!phoneNumber || !verificationCode) {
        res.status(400).send({ status: "error",message: "Missing parameters", errorCode: 1001 });
        return;
    }

    // Verify that the phone number is valid.
    if (!isValidPhoneNumber(phoneNumber)) {
        res.status(400).send({ status: "error", message: "Invalid phone number", errorCode: 1002 });
        return;
    }

    // Validate session id and verification code.
    const phoneCode = phoneCodes.get(phoneNumber) || accountCreationCodes.get(phoneNumber);
    if (!phoneCode) {
        res.status(400).send({ status: "error", message: "Invalid phone number or verification expired", errorCode: 1004 });
        return;
    }
    if (phoneCode.code !== verificationCode) {
        res.status(400).send({ status: "error", message: "Invalid verification code", errrCode: 1005 });
        return;
    }

    try {
        // Check if the user is new.
        if (!phoneCode.userId) {
            // Give token for user creation.
            const token = generateToken({ refresh: false, phoneNumber: phoneNumber, allowedRoutes: ['/oauth2/create/user']} as User, 60 * 60);
            accountCreationCodes.delete(phoneNumber);
            res.status(200).send({ status: "success", message: "Verification code correct", accountToken: token });
            return;
        }

        // Generate access token.
        let expirationTime = 24 * 60 * 60; // 24 hours in seconds.
        const accessToken = generateToken({ id: phoneCode.userId, refresh: false }, expirationTime);
        phoneCodes.delete(phoneNumber);

        // Generate refresh token.
        expirationTime *= 7; // 7 days in seconds.
        const refreshToken = generateToken({ id: phoneCode.userId, refresh: true }, expirationTime, true);
        await RefreshToken.create({ userId: phoneCode.userId, token: refreshToken, expiresAt: new Date(Date.now() + expirationTime * 1000), createdAt: new Date() });

        res.status(200).send({ status: "success", message: "Verification code correct", accessToken: accessToken, refreshToken: refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "error", message: "Error generating tokens", errorCode: 1006 });
    }
});

router.post('/create/user', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const username = req.body.username;

    if (!username) {
        res.status(400).send({ message: "Missing parameters", errorCode: 1001 });
        return;
    }

    try {
        // Check if the user already exists.
        const clientUser = await ClientUser.findOne({ phoneNumber: req.user?.phoneNumber });
        if (clientUser) {
            res.status(400).send({ status: "error", message: "User already created", errorCode: 1007 });
            return;
        }

        // Create the user.
        const user = await UserDB.create({ username: username });
        await ClientUser.create({ userId: user._id, phoneNumber: req.user?.phoneNumber });

        // Generate access token.
        let expirationTime = 24 * 60 * 60; // 24 hours in seconds.
        const accessToken = generateToken({ id: user._id, refresh: false }, expirationTime);

        // Generate refresh token.
        expirationTime *= 7; // 7 days in seconds.
        const refreshToken = generateToken({ id: user._id, refresh: true }, expirationTime, true);
        await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + expirationTime * 1000), createdAt: new Date() });

        res.status(200).send({ status: "success", message: "Account created successfully", accessToken: accessToken, refreshToken: refreshToken });
    } catch {
        res.status(500).send({ status: "error", message: "Error creating account, please try again later.", errorCode: 1008 });
    }
});

router.post('/revoke', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send({ status: "error", message: "No token specified", errorCode: 1009 });

    const tokenData: User = jwt.decode(refreshToken) as User;
    if (!tokenData || !tokenData.refresh) return res.status(400).send({ status: "error", message: "Invalid token provided", errorCode: 1010 });

    RefreshToken.findOneAndDelete({ token: refreshToken, userId: tokenData.id }).then((deletedToken) => {
        if (!deletedToken) return res.status(400).send({ status: "error", message: "Invalid token provided", errorCode: 1010  });

        res.status(200).send({ status: "success", message: "Token revoked" });
    }).catch((err) => {
        console.error(err);
        return res.status(500).send({status: "error", message: "Error revoking token", errorCode: 1011 });
    });
});

router.post('/refreshToken', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send({ status: "error", message: "No token specified", errorCode: 1009 });

    const tokenData: User = jwt.decode(refreshToken) as User;
    if (!tokenData || !tokenData.refresh) return res.status(400).send({ status: "error", message: "Invalid token provided", errorCode: 1010 });

    try {
        const deletedToken = await RefreshToken.findOneAndDelete({ token: refreshToken, userId: tokenData.id });
        if (!deletedToken) return res.status(400).send({ status: "error", message: "Invalid token provided", errorCode: 1010 });

        let expirationTime = 24 * 60 * 60;
        const accessToken = generateToken({ id: tokenData.id, refresh: false }, expirationTime);

        expirationTime *= 7; // 7 days in seconds.
        const newRefreshToken = generateToken({ id: tokenData.id, refresh: true }, expirationTime, true);
        await RefreshToken.create({ userId: tokenData.id, token: newRefreshToken, expiresAt: new Date(Date.now() + expirationTime * 1000), createdAt: new Date() });

        res.status(200).send({ status: "success", message: "Token refreshed", newAccessToken: accessToken, refreshToken: newRefreshToken });
    } catch {
        res.status(500).send({ status: "error", message: "Error refreshing token. Please try again.", errorCode: 1012 });
    }
});

export default router;