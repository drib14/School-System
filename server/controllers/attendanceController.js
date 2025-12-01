import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Student scans QR / Uploads for attendance / Teacher marks
// @route   POST /api/attendance/scan
// @access  Private
const scanAttendance = asyncHandler(async (req, res) => {
    const { studentId, courseId, status } = req.body;

    // Determine who is the subject
    let subjectId = req.user.id;
    if (studentId && req.user.role !== 'Student') {
        subjectId = studentId;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build query to check duplicate
    let query = {
        student: subjectId,
        createdAt: { $gte: today }
    };

    // If course provided, check duplicate for that course
    if (courseId) {
        query.course = courseId;
    } else {
        // If no course (Daily Attendance), ensure we don't count course-specific logs as the daily log?
        // Or we just say duplicate if one exists without course.
        query.course = null;
    }

    const existingLog = await Attendance.findOne(query);

    if (existingLog) {
        // Optional: Update status if exists?
        if (status && existingLog.status !== status) {
             existingLog.status = status;
             if (status === 'Present') existingLog.timeIn = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
             await existingLog.save();
             return res.json(existingLog);
        }

        res.status(400);
        throw new Error('Attendance already logged for this session');
    }

    // Create Log
    const timeIn = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const log = await Attendance.create({
        student: subjectId,
        course: courseId || null,
        timeIn,
        status: status || 'Verified',
        verifiedBy: (req.user.role !== 'Student') ? req.user._id : null
    });

    res.status(201).json(log);
});

// @desc    Get attendance logs (Teacher View)
// @route   GET /api/attendance
// @access  Private (Teacher/Admin)
const getAttendance = asyncHandler(async (req, res) => {
    const { courseId, date } = req.query;

    let query = {};
    if (courseId) query.course = courseId;

    if (date) {
        const startDate = new Date(date);
        startDate.setHours(0,0,0,0);
        const endDate = new Date(date);
        endDate.setHours(23,59,59,999);
        query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const logs = await Attendance.find(query)
        .populate('student', 'name email')
        .sort({ createdAt: -1 });
    res.json(logs);
});

// @desc    Get my attendance (Student View)
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = asyncHandler(async (req, res) => {
    const logs = await Attendance.find({ student: req.user._id })
        .populate('course', 'name code') // Populate course info if exists
        .sort({ createdAt: -1 });
    res.json(logs);
});

// @desc    Teacher verifies attendance
// @route   PUT /api/attendance/:id/verify
// @access  Private (Teacher/Admin)
const verifyAttendance = asyncHandler(async (req, res) => {
    const log = await Attendance.findById(req.params.id);

    if (log) {
        log.status = req.body.status || 'Present';
        log.verifiedBy = req.user._id;
        const updatedLog = await log.save();
        res.json(updatedLog);
    } else {
        res.status(404);
        throw new Error('Log not found');
    }
});

export { scanAttendance, getAttendance, getMyAttendance, verifyAttendance };
