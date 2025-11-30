import express from 'express';
import { getAdminStats, getParentStats } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, admin, getAdminStats);
router.get('/parent', protect, getParentStats);

export default router;
