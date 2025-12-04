import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getSettings)
    .put(protect, admin, updateSettings);

export default router;
