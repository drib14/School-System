import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Student scans QR / Uploads for attendance
// @route   POST /api/attendance/scan
// @access  Private
const scanAttendance = asyncHandler(async (req, res) => {
    const { studentId, location } = req.body; // Can accept studentId if teacher scans, or req.user.id if student scans

    // Determine who is the subject
    let subjectId = req.user.id;
    if (studentId && req.user.role !== 'Student') {
        subjectId = studentId;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already logged for today
    const existingLog = await Attendance.findOne({
        student: subjectId,
        createdAt: { $gte: today }
    });

    if (existingLog) {
        res.status(400);
        throw new Error('Attendance already logged for today');
    }

    // Create Log
    // User requirement: "admin system auto approve" -> Status: 'Verified'
    const timeIn = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const log = await Attendance.create({
        student: subjectId,
        timeIn,
        status: 'Verified', // Auto-approved by system
    });

    res.status(201).json(log);
});

// @desc    Get attendance logs (Teacher View)
// @route   GET /api/attendance
// @access  Private (Teacher/Admin)
const getAttendance = asyncHandler(async (req, res) => {
    const logs = await Attendance.find({})
        .populate('student', 'name email studentId section')
        .sort({ createdAt: -1 });
    res.json(logs);
});

// @desc    Get my attendance (Student View)
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = asyncHandler(async (req, res) => {
    const logs = await Attendance.find({ student: req.user._id }).sort({ createdAt: -1 });
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
