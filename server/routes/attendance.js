import express from 'express';
import { scanAttendance, getAttendance, getMyAttendance, verifyAttendance } from '../controllers/attendanceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, scanAttendance)
    .get(protect, getAttendance);

router.get('/my', protect, getMyAttendance);
router.put('/:id/verify', protect, verifyAttendance);

export default router;
