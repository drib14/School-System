import express from 'express';
import { addGrade, getGrades } from '../controllers/gradeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addGrade)
    .get(protect, getGrades);

export default router;
