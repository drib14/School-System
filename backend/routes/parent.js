const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');
const Grade = require('../models/Grade');
const { Attendance } = require('../models/Attendance') || {};
const ClassSchedule = require('../models/ClassSchedule');
const { Fee, Assessment, Payment } = require('../models/Financial');
const { Notification } = require('../models/Communication');

// Helper: get children of a parent user
async function getChildren(parentId) {
  const parent = await User.findById(parentId).populate('children', '_id');
  return parent?.children?.map(c => c._id) || [];
}

// ---- CHILDREN OVERVIEW ----
router.get('/children', protect, authorize('parent'), asyncHandler(async (req, res) => {
  const parent = await User.findById(req.user._id).populate({
    path: 'children',
    select: '-password -refreshTokens -twoFactorSecret',
    populate: { path: 'schoolId', select: 'name abbreviation logo' },
  });
  res.json({ success: true, children: parent?.children || [] });
}));

// ---- GRADES ----
router.get('/children/:childId/grades', protect, authorize('parent'), asyncHandler(async (req, res) => {
  const { childId } = req.params;
  const children = await getChildren(req.user._id);
  if (!children.some(c => c.toString() === childId)) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const { semester, academicYear } = req.query;
  const filter = { student: childId, status: { $in: ['released', 'approved'] } };
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;

  const GradeModel = require('../models/Grade');
  const grades = await GradeModel.find(filter)
    .populate('subject', 'name code units')
    .sort({ createdAt: -1 });

  const gpa = grades.length
    ? grades.reduce((s, g) => s + (g.finalRating || 0), 0) / grades.length
    : 0;

  res.json({ success: true, grades, gpa: gpa.toFixed(2) });
}));

// ---- ATTENDANCE ----
router.get('/children/:childId/attendance', protect, authorize('parent'), asyncHandler(async (req, res) => {
  const { childId } = req.params;
  const children = await getChildren(req.user._id);
  if (!children.some(c => c.toString() === childId)) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const { from, to } = req.query;
  const filter = { student: childId };
  if (from && to) filter.date = { $gte: new Date(from), $lte: new Date(to) };

  let records = [], summary = {};
  try {
    const AttendanceModel = require('../models/Attendance');
    records = await AttendanceModel.find(filter)
      .populate('subject', 'name code')
      .sort({ date: -1 }).limit(60);

    const counts = { present: 0, absent: 0, late: 0, excused: 0 };
    records.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
    const total = records.length;
    summary = { ...counts, total, rate: total > 0 ? ((counts.present + counts.late) / total * 100).toFixed(1) : '0.0' };
  } catch {}

  res.json({ success: true, records, summary });
}));

// ---- SCHEDULE ----
router.get('/children/:childId/schedule', protect, authorize('parent'), asyncHandler(async (req, res) => {
  const { childId } = req.params;
  const children = await getChildren(req.user._id);
  if (!children.some(c => c.toString() === childId)) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const schedules = await ClassSchedule.find({ enrolledStudents: childId })
    .populate('subject', 'name code units')
    .populate('teacher', 'firstName lastName avatar')
    .populate('room', 'name code building');
  res.json({ success: true, schedules });
}));

// ---- PAYMENTS ----
router.get('/children/:childId/payments', protect, authorize('parent'), asyncHandler(async (req, res) => {
  const { childId } = req.params;
  const children = await getChildren(req.user._id);
  if (!children.some(c => c.toString() === childId)) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const [assessments, payments] = await Promise.all([
    Assessment.find({ student: childId }).sort({ createdAt: -1 }),
    Payment.find({ student: childId, status: 'completed' }).sort({ createdAt: -1 }),
  ]);

  const totalBalance = assessments.reduce((s, a) => s + (a.balance || 0), 0);
  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);

  res.json({ success: true, assessments, payments, totalBalance, totalPaid });
}));

// ---- NOTIFICATIONS for parent ----
router.get('/notifications', protect, authorize('parent'), asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, notifications });
}));

module.exports = router;
