// This is the main router.
// It connects all sub-routers in one place.

import { Router } from "express";
import authRouter from './endpoints/auth.js';
import reportsRouter from './endpoints/reports.js';

const router = Router();

router.use('/reports', reportsRouter);
router.use('/', authRouter);

export default router;