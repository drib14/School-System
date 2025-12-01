import express from 'express';
import {
    getAssignments,
    createAssignment,
    submitAssignment,
    getSubmissions,
    getMySubmission,
    gradeSubmission
} from '../controllers/lmsController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/assignments', protect, getAssignments);
router.post('/assignments', protect, teacher, createAssignment);

router.post('/submissions', protect, submitAssignment);
router.get('/submissions/:assignmentId', protect, teacher, getSubmissions);
router.put('/submissions/:id/grade', protect, teacher, gradeSubmission);
router.get('/my-submission/:assignmentId', protect, getMySubmission);

export default router;
