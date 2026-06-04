const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { CampusLocation, Room, Asset } = require('../models/Campus');

const CAMPUS_ROLES = ['registrar', 'principal', 'super_admin', 'school_owner'];

// ---- CAMPUS LOCATIONS ----
router.get('/locations', protect, asyncHandler(async (req, res) => {
  const filter = { schoolId: req.user.schoolId, isActive: true };
  const campuses = await CampusLocation.find(filter).sort({ name: 1 });
  res.json({ success: true, campuses });
}));

router.post('/locations', protect, authorize('principal', 'super_admin', 'school_owner'), asyncHandler(async (req, res) => {
  const campus = await CampusLocation.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, campus });
}));

router.put('/locations/:id', protect, authorize('principal', 'super_admin', 'school_owner'), asyncHandler(async (req, res) => {
  const campus = await CampusLocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, campus });
}));

router.delete('/locations/:id', protect, authorize('principal', 'super_admin', 'school_owner'), asyncHandler(async (req, res) => {
  await CampusLocation.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Campus deactivated.' });
}));


// ---- ROOMS ----
router.get('/rooms', protect, asyncHandler(async (req, res) => {
  const { type, building, available } = req.query;
  const filter = { schoolId: req.user.schoolId, isActive: true };
  if (type) filter.type = type;
  if (building) filter.building = building;

  const rooms = await Room.find(filter).sort({ building: 1, floor: 1, name: 1 });
  res.json({ success: true, rooms });
}));

router.post('/rooms', protect, authorize(...CAMPUS_ROLES), asyncHandler(async (req, res) => {
  const room = await Room.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, room });
}));

router.put('/rooms/:id', protect, authorize(...CAMPUS_ROLES), asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, room });
}));

router.delete('/rooms/:id', protect, authorize('principal', 'super_admin'), asyncHandler(async (req, res) => {
  await Room.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Room deactivated.' });
}));

// Check room availability for a time slot
router.post('/rooms/:id/availability', protect, asyncHandler(async (req, res) => {
  const { day, startTime, endTime, academicYear, semester } = req.body;
  const ClassSchedule = require('../models/ClassSchedule');
  const conflicts = await ClassSchedule.find({
    room: req.params.id,
    academicYear,
    semester,
    isActive: true,
    'schedule.day': day,
  });

  const hasConflict = conflicts.some(cs =>
    cs.schedule.some(slot =>
      slot.day === day &&
      !(endTime <= slot.startTime || startTime >= slot.endTime)
    )
  );

  res.json({ success: true, available: !hasConflict, conflicts: hasConflict ? conflicts.length : 0 });
}));

// ---- ASSETS ----
router.get('/assets', protect, asyncHandler(async (req, res) => {
  const { type, status, location, search, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (location) filter.location = location;

  let assets = await Asset.find(filter)
    .populate('location', 'name code building')
    .populate('assignedTo', 'firstName lastName')
    .skip((page - 1) * limit).limit(Number(limit))
    .sort({ name: 1 });

  if (search) {
    const s = search.toLowerCase();
    assets = assets.filter(a =>
      a.name?.toLowerCase().includes(s) ||
      a.code?.toLowerCase().includes(s) ||
      a.serialNumber?.toLowerCase().includes(s)
    );
  }

  const total = await Asset.countDocuments(filter);
  res.json({ success: true, total, assets });
}));

router.get('/assets/:id', protect, asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('location', 'name code building')
    .populate('assignedTo', 'firstName lastName role');
  if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });
  res.json({ success: true, asset });
}));

router.post('/assets', protect, authorize(...CAMPUS_ROLES), asyncHandler(async (req, res) => {
  const asset = await Asset.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, asset });
}));

router.put('/assets/:id', protect, authorize(...CAMPUS_ROLES), asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('location', 'name code').populate('assignedTo', 'firstName lastName');
  res.json({ success: true, asset });
}));

// Add maintenance log
router.post('/assets/:id/maintenance', protect, authorize(...CAMPUS_ROLES), asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, {
    $push: { maintenanceHistory: { ...req.body, date: req.body.date || new Date() } },
    status: 'under_repair',
  }, { new: true });
  res.json({ success: true, asset });
}));

// Mark maintenance complete
router.put('/assets/:id/maintenance/:index/complete', protect, authorize(...CAMPUS_ROLES), asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, { status: 'good' }, { new: true });
  res.json({ success: true, asset });
}));

// Asset summary
router.get('/assets/summary', protect, authorize(...CAMPUS_ROLES), asyncHandler(async (req, res) => {
  const [byType, byStatus, forRepair] = await Promise.all([
    Asset.aggregate([
      { $match: { schoolId: req.user.schoolId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    Asset.aggregate([
      { $match: { schoolId: req.user.schoolId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Asset.countDocuments({ schoolId: req.user.schoolId, status: { $in: ['for_repair', 'under_repair'] } }),
  ]);
  res.json({ success: true, byType, byStatus, forRepair });
}));

module.exports = router;
