import express from "express";

// Routes
import apiV1 from "./api_v1";
import auth from "./auth";

const router: express.Router = express.Router();

router.use('/api/v1', apiV1);
router.use('/auth', auth);

export default router;