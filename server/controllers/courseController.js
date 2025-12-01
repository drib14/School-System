import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';

// @desc    Get courses
// @route   GET /api/courses
// @access  Private
const getCourses = asyncHandler(async (req, res) => {
    let query = {};

    // Role-based filtering
    if (req.user.role === 'Teacher') {
        query.teacher = req.user._id;
    }

    // Query param filtering
    if (req.query.program) {
        query.program = req.query.program;
    }
    if (req.query.yearLevel) {
        query.yearLevel = req.query.yearLevel;
    }
    if (req.query.section) {
        query.section = req.query.section;
    }

    const courses = await Course.find(query).populate('teacher', 'name email');
    res.json(courses);
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Admin)
const createCourse = asyncHandler(async (req, res) => {
    const course = await Course.create(req.body);
    res.status(201).json(course);
});

export { getCourses, createCourse };
