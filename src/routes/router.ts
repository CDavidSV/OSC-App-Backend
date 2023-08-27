import express from 'express';

// Routes
import apiV1 from './api_v1';

const router: express.Router = express.Router();

router.use('/api/v1', apiV1);

export default router;