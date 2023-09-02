import express from "express";
import { authenticateAccessToken } from "../middlewares/auth-controller";

const router: express.Router = express.Router();

router.get('/test', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    res.status(200).send({ message: "JWT Works!" });
});

export default router;