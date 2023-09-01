import express from "express";
import twilio from "twilio";
import ClientUser from "../scheemas/ClientUser";

const router: express.Router = express.Router();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const validateContentType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
        res.status(415).send({ message: "Invalid content type for login" });
        return;
    }

    next();
};

router.post('/userLogin', validateContentType, async (req: express.Request, res: express.Response) => {
    const { countryCode, phoneNumber } = req.body;

    if (!countryCode || !phoneNumber) {
        res.status(400).send({ message: "Invalid credentials" });
        return;
    }

    try {
        const user = await ClientUser.findOne({ phoneNumber: `${countryCode}${phoneNumber}` });
        
        if (!user) {
            return res.status(404).send({ status: "error", message: "User does not exist" });
        }

        await twilioClient.messages.create({
            from: twilioPhoneNumber,
            to: `${countryCode}${phoneNumber}`,
            body: "Your verification code is: 123456"
        });
        res.status(200).send({ status: "success", message: "Verification message sent" });
    } catch {
        res.status(500).send({ status: "error", message: "Error sending verification message" });
    }
});

export default router;