import express from "express";

// Routes
import userProfiles from "./userProfiles";
import searchController from "./searchController";
import review from "./review";

const router: express.Router = express.Router();

router.use('/', userProfiles);
router.use('/', searchController);
router.use('/review', review);

export default router;