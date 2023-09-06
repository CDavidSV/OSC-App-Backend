import express from "express";
import UserDB from "../../scheemas/userSchema";
import { authenticateAccessToken } from "../../middlewares/auth-controller";

const router: express.Router = express.Router();

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