import express from "express";

const router: express.Router = express.Router();

router.get('/test', async (req: any, res: any) => {
    res.status(200).send({ message: "Works!" });
});

export default router;