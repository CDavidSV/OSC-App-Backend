import express from "express";

// Routes
import userProfiles from "./userProfiles";
import searchController from "./searchController";
import associationController from "./associationController";
import tagController from "./tagController";

const router: express.Router = express.Router();

router.use('/', userProfiles);
router.use('/', searchController);
router.use('/', associationController);
router.use('/', tagController);

export default router;