const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Subject = require('../models/Subject');
const Curriculum = require('../models/Curriculum');
const ClassSchedule = require('../models/ClassSchedule');
const Program = require('../models/Program');

// ---- PROGRAMS ----
router.get('/programs', protect, asyncHandler(async (req, res) => {
  const programs = await Program.find({ schoolId: req.user.schoolId, isActive: true });
  res.json({ success: true, programs });
}));

router.post('/programs', protect, authorize('registrar','principal','super_admin'), asyncHandler(async (req, res) => {
  const program = await Program.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, program });
}));

router.put('/programs/:id', protect, authorize('registrar','principal','super_admin'), asyncHandler(async (req, res) => {
  const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, program });
}));

router.delete('/programs/:id', protect, authorize('super_admin','principal'), asyncHandler(async (req, res) => {
  await Program.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Program deactivated.' });
}));

// ---- SUBJECTS ----
router.get('/subjects', protect, asyncHandler(async (req, res) => {
  const { program, category, search, page = 1, limit = 50 } = req.query;
  const filter = { schoolId: req.user.schoolId, isActive: true };
  if (program) filter.program = program;
  if (category) filter.category = category;
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { code: { $regex: search, $options: 'i' } }];
  const subjects = await Subject.find(filter)
    .populate('prerequisites', 'name code')
    .skip((page - 1) * limit).limit(Number(limit));
  const total = await Subject.countDocuments(filter);
  res.json({ success: true, total, subjects });
}));

router.post('/subjects', protect, authorize('registrar','principal','super_admin'), asyncHandler(async (req, res) => {
  const subject = await Subject.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, subject });
}));

router.put('/subjects/:id', protect, authorize('registrar','principal','super_admin'), asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, subject });
}));

router.delete('/subjects/:id', protect, authorize('super_admin','principal'), asyncHandler(async (req, res) => {
  await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Subject deactivated.' });
}));

// ---- CURRICULUM ----
router.get('/curriculum', protect, asyncHandler(async (req, res) => {
  const curricula = await Curriculum.find({ schoolId: req.user.schoolId })
    .populate('program', 'name code')
    .populate('subjects.subject', 'name code units category');
  res.json({ success: true, curricula });
}));

router.post('/curriculum', protect, authorize('registrar','principal','super_admin'), asyncHandler(async (req, res) => {
  const curriculum = await Curriculum.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, curriculum });
}));

router.put('/curriculum/:id', protect, authorize('registrar','principal','super_admin'), asyncHandler(async (req, res) => {
  const curriculum = await Curriculum.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, curriculum });
}));

// ---- CLASS SCHEDULES ----
router.get('/schedules', protect, asyncHandler(async (req, res) => {
  const { teacherId, semester, academicYear, section, subjectId } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (teacherId) filter.teacher = teacherId;
  if (req.user.role === 'teacher') filter.teacher = req.user._id;
  if (req.user.role === 'student') filter.enrolledStudents = req.user._id;
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;
  if (section) filter.section = section;
  if (subjectId) filter.subject = subjectId;

  const schedules = await ClassSchedule.find(filter)
    .populate('subject', 'name code units type')
    .populate('teacher', 'firstName lastName email avatar')
    .populate('room', 'name code building')
    .populate('program', 'name');
  res.json({ success: true, schedules });
}));

router.post('/schedules', protect, authorize('registrar','principal','super_admin'), asyncHandler(async (req, res) => {
  // Conflict detection
  const { teacher, schedule: slots, academicYear, semester } = req.body;
  const existing = await ClassSchedule.find({ teacher, academicYear, semester, isActive: true });
  
  for (const newSlot of slots) {
    for (const existingSchedule of existing) {
      for (const slot of existingSchedule.schedule) {
        if (slot.day === newSlot.day) {
          const newStart = newSlot.startTime, newEnd = newSlot.endTime;
          const exStart = slot.startTime, exEnd = slot.endTime;
          if (newStart < exEnd && newEnd > exStart) {
            return res.status(400).json({ success: false, message: `Teacher has a scheduling conflict on ${slot.day} ${exStart}-${exEnd}.` });
          }
        }
      }
    }
  }

  const sched = await ClassSchedule.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, schedule: sched });
}));

router.put('/schedules/:id', protect, authorize('registrar','principal','super_admin'), asyncHandler(async (req, res) => {
  const sched = await ClassSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('subject', 'name code').populate('teacher', 'firstName lastName');
  res.json({ success: true, schedule: sched });
}));

router.delete('/schedules/:id', protect, authorize('registrar','principal','super_admin'), asyncHandler(async (req, res) => {
  await ClassSchedule.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Schedule deactivated.' });
}));

// ---- TEACHER LOAD ----
router.get('/teacher-load/:teacherId', protect, asyncHandler(async (req, res) => {
  const { academicYear, semester } = req.query;
  const filter = { teacher: req.params.teacherId, isActive: true };
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = semester;

  const schedules = await ClassSchedule.find(filter)
    .populate('subject', 'name code units lecUnits labUnits');
  
  const totalUnits = schedules.reduce((sum, s) => {
    const subj = s.subject;
    return sum + (subj?.units || 0);
  }, 0);

  res.json({ success: true, schedules, totalUnits, classCount: schedules.length });
}));

module.exports = router;
