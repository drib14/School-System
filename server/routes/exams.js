import express from 'express';
import { createExam, getExams, submitExam, getExamResults } from '../controllers/examController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getExams)
    .post(protect, teacher, createExam);

router.post('/:id/submit', protect, submitExam);
router.get('/:id/results', protect, getExamResults);

export default router;
