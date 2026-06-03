const { asyncHandler } = require('../middleware/errorHandler');
const Enrollment = require('../models/Enrollment');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');
const ClassSchedule = require('../models/ClassSchedule');
const { Assessment, Fee } = require('../models/Financial');
const { Notification } = require('../models/Communication');

const getEnrollments = asyncHandler(async (req, res) => {
  const { status, academicYear, semester, program, search, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (status) filter.status = status;
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = semester;
  if (program) filter.program = program;

  const total = await Enrollment.countDocuments(filter);
  const enrollments = await Enrollment.find(filter)
    .populate('student', 'firstName lastName email studentId avatar')
    .populate('program', 'name code')
    .populate('subjects.subject', 'name code units')
    .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });

  res.json({ success: true, total, pages: Math.ceil(total / limit), enrollments });
});

const getEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('student', '-password')
    .populate('program', 'name code')
    .populate('subjects.subject subjects.schedule')
    .populate('assessment')
    .populate('steps.completedBy', 'firstName lastName role');
  if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });
  res.json({ success: true, enrollment });
});

const createEnrollment = asyncHandler(async (req, res) => {
  const { studentId, academicYear, semester, program, yearLevel, gradeLevel, section, type, subjects } = req.body;

  const existing = await Enrollment.findOne({ student: studentId, academicYear, semester, schoolId: req.user.schoolId });
  if (existing) return res.status(400).json({ success: false, message: 'Student already has enrollment this term.' });

  const enrollment = await Enrollment.create({
    schoolId: req.user.schoolId, student: studentId, academicYear, semester,
    program, yearLevel, gradeLevel, section, type: type || 'returning',
    subjects: [], status: 'pending',
    steps: [
      { step: 'application', status: 'completed', completedBy: req.user._id, completedAt: new Date() },
      { step: 'verification', status: 'pending' },
      { step: 'assessment', status: 'pending' },
      { step: 'payment', status: 'pending' },
      { step: 'subject_assignment', status: 'pending' },
      { step: 'confirmation', status: 'pending' },
    ],
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Enrollment created.', enrollment });
});

const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { status, step, remarks } = req.body;
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });

  if (status) enrollment.status = status;

  if (step) {
    const stepIdx = enrollment.steps.findIndex(s => s.step === step);
    if (stepIdx >= 0) {
      enrollment.steps[stepIdx].status = 'completed';
      enrollment.steps[stepIdx].completedBy = req.user._id;
      enrollment.steps[stepIdx].completedAt = new Date();
      if (remarks) enrollment.steps[stepIdx].remarks = remarks;
    }
  }

  // Auto-advance status based on steps
  const allCompleted = enrollment.steps.every(s => s.step === 'payment' || s.status === 'completed');

  if (status === 'enrolled') {
    enrollment.confirmedBy = req.user._id;
    enrollment.confirmedAt = new Date();
    // Update student profile enrollment status
    await StudentProfile.findOneAndUpdate({ userId: enrollment.student }, { enrollmentStatus: 'enrolled' });
    // Send notification
    await Notification.create({
      schoolId: enrollment.schoolId, recipient: enrollment.student,
      title: 'Enrollment Confirmed', message: `Your enrollment for ${enrollment.academicYear} ${enrollment.semester} semester has been confirmed.`,
      type: 'enrollment',
    });
  }

  await enrollment.save();
  res.json({ success: true, message: 'Enrollment updated.', enrollment });
});

const assignSubjects = asyncHandler(async (req, res) => {
  const { subjects } = req.body; // [{ subjectId, scheduleId }]
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });

  const subjectData = [];
  let totalUnits = 0;

  for (const s of subjects) {
    const subject = await Subject.findById(s.subjectId);
    if (subject) {
      subjectData.push({ subject: s.subjectId, schedule: s.scheduleId, units: subject.units });
      totalUnits += subject.units;
      // Add student to class
      await ClassSchedule.findByIdAndUpdate(s.scheduleId, {
        $addToSet: { enrolledStudents: enrollment.student },
        $inc: { enrolledCount: 1 },
      });
    }
  }

  enrollment.subjects = subjectData;
  enrollment.totalUnits = totalUnits;
  enrollment.status = 'assessed';
  await enrollment.save();

  res.json({ success: true, message: 'Subjects assigned.', enrollment });
});

const getMyEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id })
    .sort({ createdAt: -1 })
    .populate('program', 'name code')
    .populate('subjects.subject', 'name code units')
    .populate('subjects.schedule');
  res.json({ success: true, enrollment });
});

module.exports = { getEnrollments, getEnrollment, createEnrollment, updateEnrollmentStatus, assignSubjects, getMyEnrollment };
