import express from "express";
import UserDB from "../../scheemas/userSchema";
import multer from "multer";
import { authenticateAccessToken } from "../../middlewares/auth-controller";
import { DBUser } from "../../Models/database";

const router: express.Router = express.Router();

// Configure multer for file uploads.
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/profile', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const username = req.query.username;
    const userId = req.query.uid;

    if (!username && !userId) return res.status(400).send({ status: "error", message: "No username or user id specified" });

    let user: DBUser | null;

    try {
        if (!userId) {
            user = await UserDB.findOne({ username: username });
        } else {
            user = await UserDB.findById(userId);
        }
    } catch (err) {
        return res.status(500).send({ status: "error", message: "Error while attempting to fetch user" });
    }

    if (!user) return res.status(404).send({ status: "error", message: "User not found" });

    const userData = {
        id: user.id.toString(),
        username: user.username,
        profilePicture: user.profilePictureURL,
        email: user.email,
        phoneNumber: user.phoneNumber,
    }

    return res.status(200).send({ status: "success", message: "User found", data: userData });
});

router.post('/updateUsername', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const { username } = req.body;

    if (!username) return res.status(400).send({ status: "error", message: "No username specified" });

    UserDB.findByIdAndUpdate(req.user!.id, { username: username }).then((user) => {
        res.status(200).send({ status: "success", message: "Username updated" });
    }).catch((err) => {
        res.status(500).send({ status: "error", message: "Error updating username" });
    });
});

export default router;