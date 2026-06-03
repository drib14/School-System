const { asyncHandler } = require('../middleware/errorHandler');
const Grade = require('../models/Grade');
const { Notification } = require('../models/Communication');
const { sendMail, emailTemplates } = require('../config/mailer');
const User = require('../models/User');

const getGrades = asyncHandler(async (req, res) => {
  const { studentId, teacherId, subjectId, academicYear, semester, status, page = 1, limit = 20 } = req.query;
  const filter = { };

  if (req.user.role === 'teacher') filter.teacher = req.user._id;
  else if (req.user.role === 'student') filter.student = req.user._id;
  else if (req.user.role === 'parent') filter.student = { $in: req.user.children };

  if (studentId) filter.student = studentId;
  if (teacherId) filter.teacher = teacherId;
  if (subjectId) filter.subject = subjectId;
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = semester;
  if (status) filter.status = status;

  const grades = await Grade.find(filter)
    .populate('student', 'firstName lastName studentId avatar')
    .populate('subject', 'name code units')
    .populate('teacher', 'firstName lastName')
    .skip((page - 1) * limit).limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Grade.countDocuments(filter);
  res.json({ success: true, total, grades });
});

const getGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findById(req.params.id)
    .populate('student', 'firstName lastName studentId email')
    .populate('subject', 'name code units')
    .populate('teacher', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName');
  if (!grade) return res.status(404).json({ success: false, message: 'Grade not found.' });
  res.json({ success: true, grade });
});

const createGrade = asyncHandler(async (req, res) => {
  const existing = await Grade.findOne({
    student: req.body.student, subject: req.body.subject,
    academicYear: req.body.academicYear, semester: req.body.semester,
  });
  if (existing) return res.status(400).json({ success: false, message: 'Grade record already exists for this student/subject/term.' });

  const grade = await Grade.create({
    ...req.body, teacher: req.user._id, createdBy: req.user._id,
  });
  res.status(201).json({ success: true, grade });
});

const updateGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findById(req.params.id);
  if (!grade) return res.status(404).json({ success: false, message: 'Grade not found.' });

  // Only teacher who owns it or registrar/admin can update
  if (req.user.role === 'teacher' && grade.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }
  if (['approved','released'].includes(grade.status) && req.user.role === 'teacher') {
    return res.status(403).json({ success: false, message: 'Grade already approved. Contact registrar.' });
  }

  // Compute final grade from components
  const { components, gradingWeights } = req.body;
  if (components) {
    const weights = gradingWeights || grade.gradingWeights;
    const byCategory = {};
    components.forEach(c => {
      if (!byCategory[c.category]) byCategory[c.category] = [];
      byCategory[c.category].push((c.score / c.maxScore) * 100);
    });
    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const quizAvg = avg(byCategory.quiz || []);
    const activityAvg = avg(byCategory.activity || []);
    const assignmentAvg = avg(byCategory.assignment || []);
    const projectAvg = avg(byCategory.project || []);
    const examAvg = avg(byCategory.exam || []);

    const finalRating = (
      (quizAvg * (weights.quiz / 100)) +
      (activityAvg * (weights.activity / 100)) +
      (assignmentAvg * (weights.assignment / 100)) +
      (projectAvg * (weights.project / 100)) +
      (examAvg * (weights.exam / 100))
    );

    req.body.quizAverage = quizAvg;
    req.body.activityAverage = activityAvg;
    req.body.assignmentAverage = assignmentAvg;
    req.body.projectAverage = projectAvg;
    req.body.finalRating = Math.round(finalRating * 100) / 100;
    req.body.remarks = finalRating >= 75 ? 'Passed' : 'Failed';
  }

  Object.assign(grade, req.body, { updatedBy: req.user._id });
  await grade.save();
  res.json({ success: true, grade });
});

const submitGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findById(req.params.id);
  if (!grade) return res.status(404).json({ success: false, message: 'Grade not found.' });
  if (grade.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }
  grade.status = 'submitted';
  grade.submittedAt = new Date();
  await grade.save();
  res.json({ success: true, message: 'Grade submitted for approval.', grade });
});

const approveGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findByIdAndUpdate(req.params.id, {
    status: 'approved', approvedBy: req.user._id, approvedAt: new Date(),
  }, { new: true });
  res.json({ success: true, message: 'Grade approved.', grade });
});

const releaseGrade = asyncHandler(async (req, res) => {
  const grades = await Grade.find({ schedule: req.params.scheduleId, status: 'approved' });
  const released = [];

  for (const grade of grades) {
    grade.status = 'released';
    grade.releasedAt = new Date();
    await grade.save();
    released.push(grade._id);

    // Notify student
    await Notification.create({
      schoolId: grade.schoolId || req.user.schoolId, recipient: grade.student,
      title: 'Grades Released', message: `Your grade has been released. Final Rating: ${grade.finalRating}`,
      type: 'grade', link: '/grades',
    });

    // Email notification
    try {
      const student = await User.findById(grade.student).select('email firstName');
      const subject = await require('../models/Subject').findById(grade.subject).select('name');
      if (student?.email) {
        await sendMail({ to: student.email, subject: 'ISCP - Grades Released', html: emailTemplates.gradeRelease(student.firstName, subject?.name, grade.finalRating) });
      }
    } catch (_) {}
  }

  res.json({ success: true, message: `${released.length} grades released.` });
});

const getMyGrades = asyncHandler(async (req, res) => {
  const { academicYear, semester } = req.query;
  const filter = { student: req.user._id, status: 'released' };
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = semester;

  const grades = await Grade.find(filter)
    .populate('subject', 'name code units')
    .populate('teacher', 'firstName lastName');

  const gwa = grades.length
    ? grades.reduce((sum, g) => sum + (g.finalRating || 0), 0) / grades.length
    : 0;

  res.json({ success: true, grades, gwa: Math.round(gwa * 100) / 100 });
});

module.exports = { getGrades, getGrade, createGrade, updateGrade, submitGrade, approveGrade, releaseGrade, getMyGrades };
