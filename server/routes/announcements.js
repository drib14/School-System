import express from 'express';
import { getAnnouncements, createAnnouncement } from '../controllers/announcementController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getAnnouncements)
    .post(protect, admin, createAnnouncement);

export default router;
