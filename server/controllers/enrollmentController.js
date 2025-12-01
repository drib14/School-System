import asyncHandler from 'express-async-handler';
import Enrollment from '../models/Enrollment.js';

// @desc    Get Enrollments
// @route   GET /api/enrollments
// @access  Private
const getEnrollments = asyncHandler(async (req, res) => {
    const { status, program, yearLevel, section } = req.query;
    let query = {};

    if (status) query.status = status;
    if (program) query.program = program;
    if (yearLevel) query.yearLevel = yearLevel;
    if (section) query.section = section;

    // If student, only see own
    if (req.user.role === 'Student') {
        query.student = req.user._id;
    }

    const enrollments = await Enrollment.find(query).populate('student', 'name email');
    res.json(enrollments);
});

// @desc    Create Enrollment
// @route   POST /api/enrollments
// @access  Private
const createEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.create({
        student: req.user._id,
        ...req.body
    });
    res.status(201).json(enrollment);
});

// @desc    Update Enrollment (Approve/Reject)
// @route   PUT /api/enrollments/:id
// @access  Private (Admin)
const updateEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id);
    if (enrollment) {
        enrollment.status = req.body.status || enrollment.status;
        const updatedEnrollment = await enrollment.save();
        res.json(updatedEnrollment);
    } else {
        res.status(404);
        throw new Error('Enrollment not found');
    }
});

export { getEnrollments, createEnrollment, updateEnrollment };
