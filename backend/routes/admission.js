const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { Application, EntranceExam, Interview } = require('../models/Admission');
const { Notification } = require('../models/Communication');
const User = require('../models/User');
const { sendMail, emailTemplates } = require('../config/mailer');

const ADMISSION_ROLES = ['registrar', 'principal', 'super_admin', 'school_owner'];

// ---- APPLICATIONS ----
router.get('/applications', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const { stage, status, program, academicYear, search, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (stage) filter.stage = stage;
  if (program) filter.desiredProgram = program;
  if (academicYear) filter.academicYear = academicYear;

  let applications = await Application.find(filter)
    .populate('desiredProgram', 'name code')
    .populate('assignedTo', 'firstName lastName')
    .skip((page - 1) * limit).limit(Number(limit))
    .sort({ submittedAt: -1 });

  if (search) {
    const s = search.toLowerCase();
    applications = applications.filter(a =>
      a.firstName?.toLowerCase().includes(s) ||
      a.lastName?.toLowerCase().includes(s) ||
      a.email?.toLowerCase().includes(s) ||
      a.applicationNumber?.toLowerCase().includes(s)
    );
  }

  const total = await Application.countDocuments(filter);
  res.json({ success: true, total, applications });
}));

router.get('/applications/:id', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id)
    .populate('desiredProgram', 'name code type level')
    .populate('assignedTo', 'firstName lastName email')
    .populate('linkedUser', 'firstName lastName email studentId')
    .populate('entranceExam', 'title examDate venue')
    .populate('interview', 'scheduledAt interviewer venue type');
  if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });
  res.json({ success: true, application: app });
}));

// Public submission (no auth required)
router.post('/applications', asyncHandler(async (req, res) => {
  const { schoolId, ...body } = req.body;
  const application = await Application.create({
    ...body,
    schoolId: schoolId || req.body.schoolId,
  });

  // Check if user already exists
  const existingUser = await User.findOne({ email: application.email });
  if (!existingUser) {
    // Generate ID and password
    const count = await User.countDocuments({ role: 'student', schoolId: application.schoolId });
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear().toString();
    const sequence = String(count + 1).padStart(3, '0');
    const studentId = `${month}${day}${year.slice(-2)}${sequence}`;

    const lastInitial = application.lastName.charAt(0).toUpperCase();
    const defaultPassword = `${studentId}${lastInitial}`;

    const newUser = await User.create({
      schoolId: application.schoolId,
      firstName: application.firstName,
      middleName: application.middleName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      birthDate: application.birthDate,
      gender: application.gender,
      password: defaultPassword,
      role: 'student',
      studentId: studentId,
      isActive: true,
      isEmailVerified: true // Auto verify
    });

    application.linkedUser = newUser._id;
    await application.save();

    // Email credentials immediately (as requested)
    try {
      await sendMail({
        to: application.email,
        subject: 'ISCP Application Submitted - Student Portal Credentials',
        html: emailTemplates.studentCredentials(application.firstName, studentId, defaultPassword),
      });
    } catch (err) {
      console.error('Failed to send credential email:', err);
    }
  }

  res.status(201).json({ success: true, application, message: `Application submitted. Your application number is ${application.applicationNumber}. Credentials emailed.` });
}));

router.put('/applications/:id/stage', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const updates = { stage: req.body.stage, remarks: req.body.remarks };
  if (req.body.stage === 'accepted') {
    updates.acceptedAt = new Date();
    updates.acceptedProgram = req.body.acceptedProgram;
    updates.acceptedYearLevel = req.body.acceptedYearLevel;
  }
  if (req.body.stage === 'rejected') {
    updates.rejectionReason = req.body.rejectionReason;
  }

  const application = await Application.findByIdAndUpdate(req.params.id, updates, { new: true });

  res.json({ success: true, application });
}));

router.put('/applications/:id/assign', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const application = await Application.findByIdAndUpdate(req.params.id,
    { assignedTo: req.body.assignedTo }, { new: true }
  ).populate('assignedTo', 'firstName lastName email');
  res.json({ success: true, application });
}));

router.put('/applications/:id/document/:docType/verify', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  const docIndex = application.documents.findIndex(d => d.type === req.params.docType);
  if (docIndex !== -1) {
    application.documents[docIndex].isVerified = true;
    application.documents[docIndex].verifiedBy = req.user._id;
    application.documents[docIndex].verifiedAt = new Date();
    await application.save();
  }
  res.json({ success: true, application });
}));

// ---- ENTRANCE EXAMS ----
router.get('/exams', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (status) filter.status = status;
  const exams = await EntranceExam.find(filter)
    .populate('createdBy', 'firstName lastName')
    .sort({ examDate: 1 });
  res.json({ success: true, exams });
}));

router.post('/exams', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const exam = await EntranceExam.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, exam });
}));

router.put('/exams/:id', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const exam = await EntranceExam.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, exam });
}));

router.post('/exams/:id/enroll', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const { applicationId } = req.body;
  const exam = await EntranceExam.findById(req.params.id);
  if (exam.enrolledApplicants.length >= exam.capacity) {
    return res.status(400).json({ success: false, message: 'Exam schedule is full.' });
  }
  exam.enrolledApplicants.push(applicationId);
  await exam.save();
  await Application.findByIdAndUpdate(applicationId, { entranceExam: exam._id, stage: 'exam_scheduled' });
  res.json({ success: true, exam });
}));

router.put('/exams/:id/score', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const { applicationId, score } = req.body;
  const exam = await EntranceExam.findById(req.params.id);
  const passed = score >= (exam.passingScore || 0);
  await Application.findByIdAndUpdate(applicationId, {
    examScore: score,
    examPassed: passed,
    stage: passed ? 'exam_done' : 'rejected',
    rejectionReason: !passed ? 'Did not meet entrance exam passing score.' : undefined,
  });
  res.json({ success: true, passed });
}));

// ---- INTERVIEWS ----
router.get('/interviews', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const { status, interviewer } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (status) filter.status = status;
  if (interviewer) filter.interviewer = interviewer;
  const interviews = await Interview.find(filter)
    .populate('application', 'firstName lastName applicationNumber')
    .populate('interviewer', 'firstName lastName avatar')
    .sort({ scheduledAt: 1 });
  res.json({ success: true, interviews });
}));

router.post('/interviews', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const interview = await Interview.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  await Application.findByIdAndUpdate(req.body.application, {
    interview: interview._id, stage: 'interview_scheduled',
  });
  res.status(201).json({ success: true, interview });
}));

router.put('/interviews/:id/complete', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const { score, recommendation, notes } = req.body;
  const interview = await Interview.findByIdAndUpdate(req.params.id, {
    status: 'completed', score, recommendation, notes,
  }, { new: true });

  const nextStage = recommendation === 'accept' ? 'accepted' :
                    recommendation === 'reject' ? 'rejected' :
                    recommendation === 'waitlist' ? 'waitlisted' : 'interview_done';

  await Application.findByIdAndUpdate(interview.application, {
    interviewScore: score,
    interviewPassed: recommendation === 'accept',
    stage: nextStage,
    ...(recommendation === 'accept' ? { acceptedAt: new Date() } : {}),
  });

  res.json({ success: true, interview });
}));

// Admission funnel stats
router.get('/funnel', protect, authorize(...ADMISSION_ROLES), asyncHandler(async (req, res) => {
  const { academicYear } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (academicYear) filter.academicYear = academicYear;

  const stages = ['submitted', 'document_review', 'exam_scheduled', 'exam_done', 'interview_scheduled', 'interview_done', 'accepted', 'enrolled', 'rejected'];
  const results = await Promise.all(stages.map(async s => ({
    stage: s,
    count: await Application.countDocuments({ ...filter, stage: s }),
  })));

  res.json({ success: true, funnel: results });
}));

module.exports = router;
