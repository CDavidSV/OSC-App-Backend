import express from "express";

// Routes
import userProfiles from "./userProfiles";

const router: express.Router = express.Router();

router.use('/', userProfiles);

export default router;