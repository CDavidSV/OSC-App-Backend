import express from "express";

// Routes
import apiV1 from "./api_v1/router";
import auth from "./auth";
import images from "./images";

const router: express.Router = express.Router();

router.use('/api/v1', apiV1);
router.use('/oauth2', auth);
router.use('/cdn', images)

export default router;