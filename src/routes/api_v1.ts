import express from "express";

const router: express.Router = express.Router();

router.get('/test', async (req: express.Request, res: express.Response) => {
    res.status(200).send({ message: "Works!" });
});

export default router;