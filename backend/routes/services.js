const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { ClearanceRequest, DocumentRequest, StudentOrg, OJTRecord, Alumni } = require('../models/Services');
const { Notification } = require('../models/Communication');
const User = require('../models/User');

const ADMIN_ROLES = ['registrar', 'principal', 'super_admin', 'school_owner', 'cashier', 'accountant', 'librarian', 'nurse', 'guidance_counselor'];

// ---- CLEARANCE ----
router.get('/clearance', protect, asyncHandler(async (req, res) => {
  const isAdmin = ADMIN_ROLES.includes(req.user.role);
  const { status, type, office } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (!isAdmin) filter.student = req.user._id;
  if (status) filter.overallStatus = status;
  if (type) filter.type = type;

  const requests = await ClearanceRequest.find(filter)
    .populate('student', 'firstName lastName studentId avatar')
    .populate('steps.clearedBy', 'firstName lastName role')
    .sort({ createdAt: -1 });

  // Filter by office if specified (for office-specific view)
  if (office) {
    const filtered = requests.filter(r => r.steps.some(s => s.office === office));
    return res.json({ success: true, requests: filtered });
  }

  res.json({ success: true, requests });
}));

router.post('/clearance', protect, asyncHandler(async (req, res) => {
  const existing = await ClearanceRequest.findOne({
    student: req.user._id, academicYear: req.body.academicYear,
    semester: req.body.semester, type: req.body.type, overallStatus: { $ne: 'cleared' },
  });
  if (existing) return res.status(400).json({ success: false, message: 'You already have a pending clearance request.' });

  const defaultSteps = [
    { office: 'registrar', label: 'Registrar', status: 'pending' },
    { office: 'accounting', label: 'Accounting', status: 'pending' },
    { office: 'library', label: 'Library', status: 'pending' },
    { office: 'clinic', label: 'Clinic', status: 'pending' },
    { office: 'guidance', label: 'Guidance', status: 'pending' },
    { office: 'property', label: 'Property', status: 'pending' },
  ];

  const request = await ClearanceRequest.create({
    ...req.body,
    student: req.user._id,
    schoolId: req.user.schoolId,
    steps: req.body.steps || defaultSteps,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, request });
}));

router.put('/clearance/:id/step/:office', protect, authorize(...ADMIN_ROLES), asyncHandler(async (req, res) => {
  const { status, concern, remarks } = req.body;
  const request = await ClearanceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

  const stepIndex = request.steps.findIndex(s => s.office === req.params.office);
  if (stepIndex === -1) return res.status(404).json({ success: false, message: 'Office step not found.' });

  request.steps[stepIndex].status = status;
  request.steps[stepIndex].concern = concern;
  request.steps[stepIndex].remarks = remarks;
  request.steps[stepIndex].clearedBy = req.user._id;
  request.steps[stepIndex].clearedAt = new Date();

  // Check overall status
  const allCleared = request.steps.every(s => s.status === 'cleared');
  const anyRejected = request.steps.some(s => s.status === 'rejected');
  const anyInProgress = request.steps.some(s => s.status !== 'pending');

  if (allCleared) {
    request.overallStatus = 'cleared';
    request.completedAt = new Date();
  } else if (anyRejected) {
    request.overallStatus = 'rejected';
  } else if (anyInProgress) {
    request.overallStatus = 'in_progress';
  }

  await request.save();

  await Notification.create({
    schoolId: req.user.schoolId,
    recipient: request.student,
    title: `Clearance Update - ${req.params.office.charAt(0).toUpperCase() + req.params.office.slice(1)}`,
    message: status === 'cleared' ? `You have been cleared by the ${req.params.office} office.` : `The ${req.params.office} office has a concern with your clearance: ${concern}`,
    type: 'system',
  });

  const updated = await ClearanceRequest.findById(request._id).populate('student', 'firstName lastName').populate('steps.clearedBy', 'firstName lastName role');
  res.json({ success: true, request: updated });
}));

// ---- DOCUMENT REQUESTS ----
router.get('/documents', protect, asyncHandler(async (req, res) => {
  const isAdmin = ADMIN_ROLES.includes(req.user.role);
  const { status, type } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (!isAdmin) filter.requester = req.user._id;
  if (status) filter.status = status;
  if (type) filter.documentType = type;

  const requests = await DocumentRequest.find(filter)
    .populate('requester', 'firstName lastName studentId email avatar')
    .populate('releasedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json({ success: true, requests });
}));

router.post('/documents', protect, asyncHandler(async (req, res) => {
  const request = await DocumentRequest.create({
    ...req.body,
    requester: req.user._id,
    schoolId: req.user.schoolId,
    createdBy: req.user._id,
  });

  // Notify registrar
  const registrars = await User.find({ schoolId: req.user.schoolId, role: 'registrar' }).select('_id');
  for (const r of registrars) {
    await Notification.create({
      schoolId: req.user.schoolId,
      recipient: r._id,
      sender: req.user._id,
      title: 'New Document Request',
      message: `${req.user.firstName} ${req.user.lastName} requested a ${req.body.documentType.replace(/_/g, ' ')}.`,
      type: 'reminder',
    });
  }

  res.status(201).json({ success: true, request });
}));

router.put('/documents/:id/status', protect, authorize(...ADMIN_ROLES), asyncHandler(async (req, res) => {
  const updates = { status: req.body.status, notes: req.body.notes };
  if (req.body.status === 'released') {
    updates.releasedAt = new Date();
    updates.releasedBy = req.user._id;
  }
  const request = await DocumentRequest.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate('requester', 'firstName email _id');

  const statusMessages = {
    processing: 'Your document request is now being processed.',
    ready: 'Your requested document is ready for pickup.',
    released: 'Your document has been released.',
    cancelled: 'Your document request was cancelled.',
  };

  if (statusMessages[req.body.status]) {
    await Notification.create({
      schoolId: req.user.schoolId,
      recipient: request.requester._id,
      title: 'Document Request Update',
      message: statusMessages[req.body.status],
      type: 'system',
    });
  }

  res.json({ success: true, request });
}));

// ---- STUDENT ORGANIZATIONS ----
router.get('/organizations', protect, asyncHandler(async (req, res) => {
  const { type, search } = req.query;
  const filter = { schoolId: req.user.schoolId, isActive: true };
  if (type) filter.type = type;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const orgs = await StudentOrg.find(filter)
    .populate('adviser', 'firstName lastName avatar')
    .populate('officers.student', 'firstName lastName avatar')
    .sort({ name: 1 });
  res.json({ success: true, organizations: orgs });
}));

router.get('/organizations/:id', protect, asyncHandler(async (req, res) => {
  const org = await StudentOrg.findById(req.params.id)
    .populate('adviser', 'firstName lastName avatar email')
    .populate('officers.student', 'firstName lastName avatar studentId')
    .populate('members.student', 'firstName lastName avatar studentId');
  res.json({ success: true, organization: org });
}));

router.post('/organizations', protect, authorize('registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const org = await StudentOrg.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, organization: org });
}));

router.put('/organizations/:id', protect, authorize('registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const org = await StudentOrg.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, organization: org });
}));

router.post('/organizations/:id/join', protect, authorize('student'), asyncHandler(async (req, res) => {
  const org = await StudentOrg.findById(req.params.id);
  const isMember = org.members.some(m => m.student.toString() === req.user._id.toString());
  if (isMember) return res.status(400).json({ success: false, message: 'Already a member.' });

  org.members.push({ student: req.user._id, joinDate: new Date(), status: 'active' });
  await org.save();
  res.json({ success: true, message: 'Joined organization.' });
}));

// ---- OJT / INTERNSHIP ----
router.get('/ojt', protect, asyncHandler(async (req, res) => {
  const isAdmin = ['registrar', 'principal', 'super_admin', 'teacher'].includes(req.user.role);
  const filter = { schoolId: req.user.schoolId };
  if (!isAdmin) filter.student = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const records = await OJTRecord.find(filter)
    .populate('student', 'firstName lastName studentId avatar')
    .populate('approvedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json({ success: true, records });
}));

router.post('/ojt', protect, asyncHandler(async (req, res) => {
  const record = await OJTRecord.create({
    ...req.body,
    student: req.user.role === 'student' ? req.user._id : req.body.student,
    schoolId: req.user.schoolId,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, record });
}));

router.post('/ojt/:id/dtr', protect, authorize('student'), asyncHandler(async (req, res) => {
  const record = await OJTRecord.findByIdAndUpdate(req.params.id, {
    $push: { dtrLogs: req.body },
    $inc: { completedHours: req.body.hoursRendered || 0 },
  }, { new: true });
  res.json({ success: true, record });
}));

router.post('/ojt/:id/report', protect, authorize('student'), asyncHandler(async (req, res) => {
  const record = await OJTRecord.findByIdAndUpdate(req.params.id, {
    $push: { weeklyReports: { ...req.body, submittedAt: new Date() } },
  }, { new: true });
  res.json({ success: true, record });
}));

router.put('/ojt/:id/grade', protect, authorize('teacher', 'registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const record = await OJTRecord.findByIdAndUpdate(req.params.id, {
    finalGrade: req.body.finalGrade,
    status: req.body.status || 'completed',
  }, { new: true }).populate('student', 'firstName email _id');

  await Notification.create({
    schoolId: req.user.schoolId,
    recipient: record.student._id,
    title: 'OJT Grade Posted',
    message: `Your OJT/Internship has been graded. Final grade: ${req.body.finalGrade}.`,
    type: 'grade',
  });

  res.json({ success: true, record });
}));

// ---- ALUMNI ----
router.get('/alumni', protect, asyncHandler(async (req, res) => {
  const { program, yearGraduated, search, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (program) filter.program = program;
  if (yearGraduated) filter.yearGraduated = Number(yearGraduated);
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Alumni.countDocuments(filter);
  const alumni = await Alumni.find(filter)
    .populate('program', 'name code')
    .skip((page - 1) * limit).limit(Number(limit))
    .sort({ yearGraduated: -1 });
  res.json({ success: true, total, alumni });
}));

router.post('/alumni', protect, authorize('registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const alumnus = await Alumni.create({ ...req.body, schoolId: req.user.schoolId });
  res.status(201).json({ success: true, alumnus });
}));

router.put('/alumni/:id', protect, authorize('registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const alumnus = await Alumni.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, alumnus });
}));

module.exports = router;
