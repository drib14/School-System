const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { Visitor, GatePass, IncidentReport } = require('../models/Services');
const { Notification } = require('../models/Communication');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

// ---- VISITORS ----
router.get('/visitors', protect, authorize('registrar', 'principal', 'super_admin', 'school_owner', 'hr_staff'), asyncHandler(async (req, res) => {
  const { date, status, search } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (status) filter.status = status;
  if (date) {
    const d = new Date(date);
    filter.timeIn = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  }

  let visitors = await Visitor.find(filter)
    .populate('approvedBy', 'firstName lastName')
    .sort({ timeIn: -1 })
    .limit(100);

  if (search) {
    const s = search.toLowerCase();
    visitors = visitors.filter(v =>
      v.firstName?.toLowerCase().includes(s) ||
      v.lastName?.toLowerCase().includes(s) ||
      v.idNumber?.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, visitors });
}));

router.post('/visitors', protect, asyncHandler(async (req, res) => {
  const passCode = uuidv4().slice(0, 8).toUpperCase();
  const qrData = JSON.stringify({ type: 'visitor', code: passCode, name: `${req.body.firstName} ${req.body.lastName}` });
  const qrCode = await qrcode.toDataURL(qrData);

  const visitor = await Visitor.create({
    ...req.body,
    schoolId: req.user.schoolId,
    qrCode,
    approvedBy: req.user._id,
    status: 'checked_in',
  });

  res.status(201).json({ success: true, visitor });
}));

router.put('/visitors/:id/checkout', protect, asyncHandler(async (req, res) => {
  const visitor = await Visitor.findByIdAndUpdate(req.params.id, {
    timeOut: new Date(), status: 'checked_out', remarks: req.body.remarks,
  }, { new: true });
  res.json({ success: true, visitor });
}));

router.get('/visitors/today', protect, asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [checkedIn, checkedOut, total] = await Promise.all([
    Visitor.countDocuments({ schoolId: req.user.schoolId, timeIn: { $gte: today }, status: 'checked_in' }),
    Visitor.countDocuments({ schoolId: req.user.schoolId, timeIn: { $gte: today }, status: 'checked_out' }),
    Visitor.countDocuments({ schoolId: req.user.schoolId, timeIn: { $gte: today } }),
  ]);
  res.json({ success: true, checkedIn, checkedOut, total });
}));

// ---- GATE PASS ----
router.get('/gate-pass', protect, asyncHandler(async (req, res) => {
  const isAdmin = ['registrar', 'principal', 'super_admin', 'school_owner'].includes(req.user.role);
  const { status, personType, date } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (!isAdmin) filter.person = req.user._id;
  if (status) filter.status = status;
  if (personType) filter.personType = personType;
  if (date) {
    const d = new Date(date);
    filter.timeOut = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  }

  const passes = await GatePass.find(filter)
    .populate('person', 'firstName lastName avatar studentId employeeId role')
    .populate('approvedBy', 'firstName lastName')
    .sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, passes });
}));

router.post('/gate-pass', protect, asyncHandler(async (req, res) => {
  const passNumber = `GP-${Date.now().toString(36).toUpperCase()}`;
  const qrData = JSON.stringify({ type: 'gate_pass', passNumber, person: req.user._id });
  const qrCode = await qrcode.toDataURL(qrData);

  const pass = await GatePass.create({
    ...req.body,
    schoolId: req.user.schoolId,
    person: req.body.person || req.user._id,
    personType: req.body.personType || req.user.role,
    passNumber, qrCode,
    status: ['principal', 'registrar', 'super_admin'].includes(req.user.role) ? 'approved' : 'pending',
    approvedBy: ['principal', 'registrar', 'super_admin'].includes(req.user.role) ? req.user._id : undefined,
    approvedAt: ['principal', 'registrar', 'super_admin'].includes(req.user.role) ? new Date() : undefined,
  });

  res.status(201).json({ success: true, pass });
}));

router.put('/gate-pass/:id/approve', protect, authorize('registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const pass = await GatePass.findByIdAndUpdate(req.params.id, {
    status: 'approved', approvedBy: req.user._id, approvedAt: new Date(),
  }, { new: true }).populate('person', 'firstName email _id');

  await Notification.create({
    schoolId: req.user.schoolId,
    recipient: pass.person._id,
    title: 'Gate Pass Approved',
    message: `Your gate pass (${pass.passNumber}) has been approved.`,
    type: 'system',
  });

  res.json({ success: true, pass });
}));

router.put('/gate-pass/:id/return', protect, asyncHandler(async (req, res) => {
  const pass = await GatePass.findByIdAndUpdate(req.params.id, {
    status: 'returned', actualReturn: new Date(),
  }, { new: true });
  res.json({ success: true, pass });
}));

// ---- INCIDENT REPORTS ----
router.get('/incidents', protect, authorize('registrar', 'principal', 'super_admin', 'guidance_counselor', 'school_owner'), asyncHandler(async (req, res) => {
  const { type, severity, status, search, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (type) filter.type = type;
  if (severity) filter.severity = severity;
  if (status) filter.status = status;

  let incidents = await IncidentReport.find(filter)
    .populate('student', 'firstName lastName studentId avatar')
    .populate('reportedBy', 'firstName lastName role')
    .populate('investigatedBy', 'firstName lastName')
    .skip((page - 1) * limit).limit(Number(limit))
    .sort({ createdAt: -1 });

  if (search) {
    const s = search.toLowerCase();
    incidents = incidents.filter(i => i.reportNumber?.toLowerCase().includes(s) || i.description?.toLowerCase().includes(s));
  }

  const total = await IncidentReport.countDocuments(filter);
  res.json({ success: true, total, incidents });
}));

router.get('/incidents/:id', protect, authorize('registrar', 'principal', 'super_admin', 'guidance_counselor'), asyncHandler(async (req, res) => {
  const incident = await IncidentReport.findById(req.params.id)
    .populate('student', 'firstName lastName studentId avatar')
    .populate('reportedBy', 'firstName lastName role avatar')
    .populate('investigatedBy', 'firstName lastName')
    .populate('resolvedBy', 'firstName lastName');
  if (!incident) return res.status(404).json({ success: false, message: 'Incident not found.' });
  res.json({ success: true, incident });
}));

router.post('/incidents', protect, asyncHandler(async (req, res) => {
  const count = await IncidentReport.countDocuments({ schoolId: req.user.schoolId });
  const year = new Date().getFullYear().toString().slice(-2);
  const reportNumber = `INC-${year}-${String(count + 1).padStart(4, '0')}`;

  const incident = await IncidentReport.create({
    ...req.body, schoolId: req.user.schoolId,
    reportNumber, reportedBy: req.user._id,
  });

  // Notify principal for critical incidents
  if (req.body.severity === 'critical' || req.body.severity === 'major') {
    const principals = await User.find({ schoolId: req.user.schoolId, role: { $in: ['principal', 'super_admin'] } }).select('_id');
    for (const p of principals) {
      await Notification.create({
        schoolId: req.user.schoolId,
        recipient: p._id,
        sender: req.user._id,
        title: `⚠️ ${req.body.severity.toUpperCase()} Incident Reported`,
        message: `Incident Report ${reportNumber}: ${req.body.description?.substring(0, 100)}...`,
        type: 'alert',
        priority: 'urgent',
      });
    }
  }

  res.status(201).json({ success: true, incident });
}));

router.put('/incidents/:id', protect, authorize('registrar', 'principal', 'super_admin', 'guidance_counselor'), asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (req.body.status === 'resolved') {
    updates.resolvedBy = req.user._id;
    updates.resolvedAt = new Date();
  }
  const incident = await IncidentReport.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json({ success: true, incident });
}));

router.put('/incidents/:id/assign', protect, authorize('principal', 'super_admin'), asyncHandler(async (req, res) => {
  const incident = await IncidentReport.findByIdAndUpdate(req.params.id, {
    investigatedBy: req.body.investigatorId,
    status: 'under_investigation',
  }, { new: true }).populate('investigatedBy', 'firstName email _id');

  await Notification.create({
    schoolId: req.user.schoolId,
    recipient: req.body.investigatorId,
    title: 'Incident Investigation Assigned',
    message: `You have been assigned to investigate Incident Report ${incident.reportNumber}.`,
    type: 'alert',
  });

  res.json({ success: true, incident });
}));

// Security Analytics
router.get('/security/summary', protect, authorize('registrar', 'principal', 'super_admin', 'school_owner'), asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [visitorsToday, pendingPasses, openIncidents, incidentsByType] = await Promise.all([
    Visitor.countDocuments({ schoolId: req.user.schoolId, timeIn: { $gte: today } }),
    GatePass.countDocuments({ schoolId: req.user.schoolId, status: 'pending' }),
    IncidentReport.countDocuments({ schoolId: req.user.schoolId, status: { $in: ['open', 'under_investigation'] } }),
    IncidentReport.aggregate([
      { $match: { schoolId: req.user.schoolId, createdAt: { $gte: thisMonth } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
  ]);

  res.json({ success: true, visitorsToday, pendingPasses, openIncidents, incidentsByType });
}));

module.exports = router;
