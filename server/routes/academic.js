import express from 'express';
import {
    getDepartments, createDepartment,
    getPrograms, createProgram,
    getSections, createSection
} from '../controllers/academicController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/departments')
    .get(protect, getDepartments)
    .post(protect, admin, createDepartment);

router.route('/programs')
    .get(protect, getPrograms)
    .post(protect, admin, createProgram);

router.route('/sections')
    .get(protect, getSections)
    .post(protect, admin, createSection);

export default router;
