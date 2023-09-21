import express from "express";

// Routes
import userProfiles from "./userProfiles";
import searchController from "./searchController";

const router: express.Router = express.Router();

router.use('/', userProfiles);
router.use('/', searchController);

export default router;