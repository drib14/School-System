import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';

// @desc    Get courses
// @route   GET /api/courses
// @access  Private
const getCourses = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === 'Teacher') {
        query.teacher = req.user._id;
    }
    const courses = await Course.find(query).populate('teacher', 'name');
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
