import express from "express";

// Routes
import userProfiles from "./userProfiles";
import searchController from "./searchController";
import associationController from "./associationController";
import tagController from "./tagController";
import categoryController from "./categoryController";
import review from "./review";

const router: express.Router = express.Router();

router.use('/', userProfiles);
router.use('/', searchController);
router.use('/', associationController);
router.use('/', categoryController);
router.use('/', tagController);
router.use('/review', review);

export default router;