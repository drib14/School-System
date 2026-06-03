const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { Enrollment } = require('../models/Enrollment') || {};
const { Payment, Assessment } = require('../models/Financial');
const { AuditLog } = require('../models/Campus');

const ANALYTICS_ROLES = ['principal', 'super_admin', 'school_owner', 'registrar', 'cashier', 'accountant'];

// ---- ENROLLMENT TRENDS ----
router.get('/enrollment-trends', protect, authorize(...ANALYTICS_ROLES), asyncHandler(async (req, res) => {
  const { years = 5 } = req.query;
  const currentYear = new Date().getFullYear();
  const results = [];

  for (let y = currentYear - Number(years) + 1; y <= currentYear; y++) {
    const yearStr = `${y}-${y + 1}`;
    try {
      const EnrollmentModel = require('../models/Enrollment');
      const count = await EnrollmentModel.countDocuments({ schoolId: req.user.schoolId, academicYear: yearStr });
      results.push({ year: yearStr, count });
    } catch {
      results.push({ year: yearStr, count: 0 });
    }
  }

  res.json({ success: true, trends: results });
}));

// ---- ENROLLMENT BY PROGRAM ----
router.get('/enrollment-by-program', protect, authorize(...ANALYTICS_ROLES), asyncHandler(async (req, res) => {
  const { academicYear } = req.query;
  try {
    const EnrollmentModel = require('../models/Enrollment');
    const filter = { schoolId: req.user.schoolId };
    if (academicYear) filter.academicYear = academicYear;

    const data = await EnrollmentModel.aggregate([
      { $match: filter },
      { $group: { _id: '$program', count: { $sum: 1 } } },
      { $lookup: { from: 'programs', localField: '_id', foreignField: '_id', as: 'program' } },
      { $unwind: { path: '$program', preserveNullAndEmpty: true } },
      { $project: { _id: 1, count: 1, name: '$program.name', code: '$program.code' } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data });
  } catch { res.json({ success: true, data: [] }); }
}));

// ---- STUDENT PERFORMANCE ----
router.get('/student-performance', protect, authorize(...ANALYTICS_ROLES), asyncHandler(async (req, res) => {
  const { academicYear, semester } = req.query;
  try {
    const GradeModel = require('../models/Grade');
    const filter = { schoolId: req.user.schoolId, status: 'released' };
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const [gpaDistribution, passRate, failRate] = await Promise.all([
      GradeModel.aggregate([
        { $match: filter },
        {
          $bucket: {
            groupBy: '$finalRating',
            boundaries: [0, 60, 70, 75, 80, 85, 90, 95, 101],
            default: 'Other',
            output: { count: { $sum: 1 } },
          },
        },
      ]),
      GradeModel.countDocuments({ ...filter, remarks: 'Passed' }),
      GradeModel.countDocuments({ ...filter, remarks: 'Failed' }),
    ]);

    const total = passRate + failRate;
    res.json({
      success: true,
      gpaDistribution,
      passRate: total > 0 ? ((passRate / total) * 100).toFixed(1) : 0,
      failRate: total > 0 ? ((failRate / total) * 100).toFixed(1) : 0,
      totalGraded: total,
    });
  } catch { res.json({ success: true, gpaDistribution: [], passRate: 0, failRate: 0, totalGraded: 0 }); }
}));

// ---- FINANCIAL ANALYTICS ----
router.get('/financial', protect, authorize('cashier', 'accountant', 'principal', 'super_admin', 'school_owner'), asyncHandler(async (req, res) => {
  const { year } = req.query;
  const currentYear = new Date().getFullYear();
  const y = Number(year) || currentYear;

  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        schoolId: req.user.schoolId, status: 'completed',
        paidAt: { $gte: new Date(`${y}-01-01`), $lte: new Date(`${y}-12-31`) },
      },
    },
    {
      $group: {
        _id: { $month: '$paidAt' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth = months.map((month, i) => {
    const found = monthlyRevenue.find(m => m._id === i + 1);
    return { month, total: found?.total || 0, count: found?.count || 0 };
  });

  const [totalRevenue, pendingBalance, byMethod, outstandingCount] = await Promise.all([
    Payment.aggregate([{ $match: { schoolId: req.user.schoolId, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Assessment.aggregate([{ $match: { schoolId: req.user.schoolId } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
    Payment.aggregate([
      { $match: { schoolId: req.user.schoolId, status: 'completed' } },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Assessment.countDocuments({ schoolId: req.user.schoolId, status: { $in: ['pending', 'partial', 'overdue'] } }),
  ]);

  res.json({
    success: true,
    revenueByMonth,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingBalance: pendingBalance[0]?.total || 0,
    byMethod,
    outstandingCount,
    year: y,
  });
}));

// ---- ATTENDANCE ANALYTICS ----
router.get('/attendance', protect, authorize(...ANALYTICS_ROLES), asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  try {
    const AttendanceModel = require('../models/Attendance');
    const filter = { schoolId: req.user.schoolId };
    if (from && to) filter.date = { $gte: new Date(from), $lte: new Date(to) };

    const [byStatus, byDate, schoolRate] = await Promise.all([
      AttendanceModel.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      AttendanceModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } }, { $limit: 30 },
      ]),
      AttendanceModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalPresent = schoolRate[0]?.present || 0;
    const totalRecords = schoolRate[0]?.total || 0;
    const rate = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : '0.0';

    res.json({ success: true, byStatus, byDate, attendanceRate: rate, totalRecords });
  } catch { res.json({ success: true, byStatus: [], byDate: [], attendanceRate: '0.0', totalRecords: 0 }); }
}));

// ---- STUDENT DEMOGRAPHICS ----
router.get('/demographics', protect, authorize(...ANALYTICS_ROLES), asyncHandler(async (req, res) => {
  const [byGender, byRole, total] = await Promise.all([
    User.aggregate([
      { $match: { schoolId: req.user.schoolId, role: 'student', isActive: true } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { schoolId: req.user.schoolId, isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    User.countDocuments({ schoolId: req.user.schoolId, isActive: true }),
  ]);

  res.json({ success: true, byGender, byRole, total });
}));

// ---- AUDIT LOGS ----
router.get('/audit-logs', protect, authorize('principal', 'super_admin', 'school_owner'), asyncHandler(async (req, res) => {
  const { module, action, userId, page = 1, limit = 50 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (module) filter.module = module;
  if (action) filter.action = { $regex: action, $options: 'i' };
  if (userId) filter.user = userId;

  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .populate('user', 'firstName lastName email role avatar')
    .skip((page - 1) * limit).limit(Number(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, total, logs });
}));

module.exports = router;
