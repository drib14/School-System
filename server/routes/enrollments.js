import express from 'express';
import { getEnrollments, createEnrollment, updateEnrollment } from '../controllers/enrollmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getEnrollments)
    .post(protect, createEnrollment);

router.route('/:id')
    .put(protect, admin, updateEnrollment);

export default router;
