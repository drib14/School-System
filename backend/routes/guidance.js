const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { GuidanceCase } = require('../models/Services');
const { Notification } = require('../models/Communication');
const User = require('../models/User');

const GUIDANCE_ROLES = ['guidance_counselor', 'principal', 'super_admin', 'school_owner'];

// ---- GUIDANCE CASES ----
router.get('/cases', protect, authorize(...GUIDANCE_ROLES), asyncHandler(async (req, res) => {
  const { status, priority, caseType, counselorId, search, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (req.user.role === 'guidance_counselor') filter.counselor = req.user._id;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (caseType) filter.caseType = caseType;
  if (counselorId) filter.counselor = counselorId;

  let cases = await GuidanceCase.find(filter)
    .populate('student', 'firstName lastName studentId avatar')
    .populate('counselor', 'firstName lastName avatar')
    .skip((page - 1) * limit).limit(Number(limit))
    .sort({ createdAt: -1 });

  if (search) {
    const s = search.toLowerCase();
    cases = cases.filter(c =>
      c.caseNumber?.toLowerCase().includes(s) ||
      c.student?.firstName?.toLowerCase().includes(s) ||
      c.student?.lastName?.toLowerCase().includes(s)
    );
  }

  const total = await GuidanceCase.countDocuments(filter);
  res.json({ success: true, total, cases });
}));

router.get('/cases/:id', protect, authorize(...GUIDANCE_ROLES), asyncHandler(async (req, res) => {
  const gcase = await GuidanceCase.findById(req.params.id)
    .populate('student', 'firstName lastName studentId avatar birthDate gender')
    .populate('counselor', 'firstName lastName avatar email')
    .populate('sessions.conductedBy', 'firstName lastName');
  if (!gcase) return res.status(404).json({ success: false, message: 'Case not found.' });
  res.json({ success: true, case: gcase });
}));

router.post('/cases', protect, authorize(...GUIDANCE_ROLES), asyncHandler(async (req, res) => {
  const gcase = await GuidanceCase.create({
    ...req.body,
    schoolId: req.user.schoolId,
    counselor: req.body.counselor || req.user._id,
    createdBy: req.user._id,
  });

  // Notify student if not confidential
  if (!req.body.isConfidential) {
    await Notification.create({
      schoolId: req.user.schoolId,
      recipient: req.body.student,
      title: 'Guidance Counseling',
      message: `A guidance case has been opened for you. Case #${gcase.caseNumber}.`,
      type: 'reminder',
    });
  }

  const populated = await GuidanceCase.findById(gcase._id)
    .populate('student', 'firstName lastName studentId')
    .populate('counselor', 'firstName lastName');
  res.status(201).json({ success: true, case: populated });
}));

router.put('/cases/:id', protect, authorize(...GUIDANCE_ROLES), asyncHandler(async (req, res) => {
  const gcase = await GuidanceCase.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('student', 'firstName lastName')
    .populate('counselor', 'firstName lastName');
  res.json({ success: true, case: gcase });
}));

// Add session to case
router.post('/cases/:id/session', protect, authorize(...GUIDANCE_ROLES), asyncHandler(async (req, res) => {
  const gcase = await GuidanceCase.findByIdAndUpdate(req.params.id, {
    $push: {
      sessions: {
        ...req.body,
        conductedBy: req.user._id,
        date: req.body.date || new Date(),
      },
    },
    status: 'in_progress',
  }, { new: true }).populate('sessions.conductedBy', 'firstName lastName');

  res.json({ success: true, case: gcase });
}));

// Add intervention
router.post('/cases/:id/intervention', protect, authorize(...GUIDANCE_ROLES), asyncHandler(async (req, res) => {
  const gcase = await GuidanceCase.findByIdAndUpdate(req.params.id, {
    $push: { interventions: { ...req.body, date: req.body.date || new Date() } },
  }, { new: true });
  res.json({ success: true, case: gcase });
}));

// Close case
router.put('/cases/:id/close', protect, authorize(...GUIDANCE_ROLES), asyncHandler(async (req, res) => {
  const gcase = await GuidanceCase.findByIdAndUpdate(req.params.id, {
    status: 'closed',
    closedAt: new Date(),
    closingNotes: req.body.closingNotes,
  }, { new: true });
  res.json({ success: true, case: gcase });
}));

// Notify parents
router.post('/cases/:id/notify-parent', protect, authorize(...GUIDANCE_ROLES), asyncHandler(async (req, res) => {
  const gcase = await GuidanceCase.findById(req.params.id).populate('student', 'parentOf firstName lastName');
  if (!gcase) return res.status(404).json({ success: false, message: 'Case not found.' });

  const student = await User.findById(gcase.student._id).populate('parentOf', '_id firstName');
  if (student?.parentOf?.length) {
    for (const parent of student.parentOf) {
      await Notification.create({
        schoolId: req.user.schoolId,
        recipient: parent._id,
        title: 'Guidance Office Notice',
        message: req.body.message || `We would like to inform you regarding ${gcase.student.firstName} ${gcase.student.lastName}. Please coordinate with the guidance office.`,
        type: 'alert',
        priority: 'high',
      });
    }
    await GuidanceCase.findByIdAndUpdate(gcase._id, { parentNotified: true, parentNotifiedAt: new Date() });
  }

  res.json({ success: true, message: 'Parents notified.' });
}));

// Summary stats
router.get('/summary', protect, authorize(...GUIDANCE_ROLES), asyncHandler(async (req, res) => {
  const [totalOpen, totalInProgress, totalClosed, byType, byPriority] = await Promise.all([
    GuidanceCase.countDocuments({ schoolId: req.user.schoolId, status: 'open' }),
    GuidanceCase.countDocuments({ schoolId: req.user.schoolId, status: 'in_progress' }),
    GuidanceCase.countDocuments({ schoolId: req.user.schoolId, status: 'closed' }),
    GuidanceCase.aggregate([
      { $match: { schoolId: req.user.schoolId } },
      { $group: { _id: '$caseType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    GuidanceCase.aggregate([
      { $match: { schoolId: req.user.schoolId, status: { $ne: 'closed' } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
  ]);

  res.json({ success: true, totalOpen, totalInProgress, totalClosed, byType, byPriority });
}));

module.exports = router;
