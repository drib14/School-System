const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { Lesson, Quiz, QuizAttempt, Assignment, Submission, Discussion, LearningProgress } = require('../models/LMS');
const { Notification } = require('../models/Communication');
const ClassSchedule = require('../models/ClassSchedule');

// ---- LESSONS ----
router.get('/lessons', protect, asyncHandler(async (req, res) => {
  const { scheduleId, week, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (scheduleId) filter.scheduleId = scheduleId;
  if (req.user.role === 'teacher') filter.teacher = req.user._id;
  if (week) filter.weekNumber = Number(week);
  
  // Students only see published
  if (req.user.role === 'student') filter.isPublished = true;

  const total = await Lesson.countDocuments(filter);
  const lessons = await Lesson.find(filter)
    .populate('teacher', 'firstName lastName avatar')
    .sort({ weekNumber: 1, order: 1 })
    .skip((page - 1) * limit).limit(Number(limit));

  res.json({ success: true, total, lessons });
}));

router.get('/lessons/:id', protect, asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id)
    .populate('teacher', 'firstName lastName avatar');
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

  // Track view
  if (req.user.role === 'student') {
    await Lesson.findByIdAndUpdate(lesson._id, { $inc: { views: 1 } });
  }

  res.json({ success: true, lesson });
}));

router.post('/lessons', protect, authorize('teacher', 'registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const lesson = await Lesson.create({
    ...req.body,
    schoolId: req.user.schoolId,
    teacher: req.user._id,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, lesson });
}));

router.put('/lessons/:id', protect, authorize('teacher', 'registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const lesson = await Lesson.findOneAndUpdate(
    { _id: req.params.id, schoolId: req.user.schoolId },
    req.body, { new: true }
  );
  res.json({ success: true, lesson });
}));

router.put('/lessons/:id/publish', protect, authorize('teacher', 'registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id,
    { isPublished: true, publishedAt: new Date() }, { new: true }
  );

  // Get students in the class schedule
  const schedule = await ClassSchedule.findById(lesson.scheduleId).populate('enrolledStudents', '_id');
  if (schedule?.enrolledStudents?.length) {
    const notifs = schedule.enrolledStudents.map(s => ({
      schoolId: req.user.schoolId,
      recipient: s._id,
      sender: req.user._id,
      title: 'New Lesson Available',
      message: `A new lesson "${lesson.title}" has been published.`,
      type: 'reminder',
      link: `/lms/lessons/${lesson._id}`,
    }));
    await Notification.insertMany(notifs);
    req.app.get('io')?.to(`school-${req.user.schoolId}`).emit('new-lesson', { lesson });
  }

  res.json({ success: true, lesson });
}));

router.post('/lessons/:id/complete', protect, authorize('student'), asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  const alreadyCompleted = lesson.completions.some(c => c.student.toString() === req.user._id.toString());
  if (!alreadyCompleted) {
    await Lesson.findByIdAndUpdate(req.params.id, {
      $push: { completions: { student: req.user._id, completedAt: new Date() } },
    });
  }
  res.json({ success: true, message: 'Lesson marked as complete.' });
}));

router.delete('/lessons/:id', protect, authorize('teacher', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  await Lesson.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Lesson deleted.' });
}));

// ---- QUIZZES ----
router.get('/quizzes', protect, asyncHandler(async (req, res) => {
  const { scheduleId } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (scheduleId) filter.scheduleId = scheduleId;
  if (req.user.role === 'teacher') filter.teacher = req.user._id;
  if (req.user.role === 'student') filter.isPublished = true;

  const quizzes = await Quiz.find(filter)
    .select('-questions.correctAnswer') // hide answers for students
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json({ success: true, quizzes });
}));

router.get('/quizzes/:id', protect, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('teacher', 'firstName lastName avatar');
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

  // Check attempts
  const attemptCount = await QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user._id });
  const canAttempt = req.user.role !== 'student' || attemptCount < quiz.allowedAttempts;

  // Strip answers for students
  const data = quiz.toObject();
  if (req.user.role === 'student') {
    data.questions = data.questions.map(q => { const { correctAnswer, explanation, ...rest } = q; return rest; });
  }

  res.json({ success: true, quiz: data, attemptCount, canAttempt });
}));

router.post('/quizzes', protect, authorize('teacher', 'registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  // Calculate total points
  const totalPoints = (req.body.questions || []).reduce((sum, q) => sum + (q.points || 1), 0);
  const quiz = await Quiz.create({
    ...req.body, totalPoints,
    schoolId: req.user.schoolId,
    teacher: req.user._id,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, quiz });
}));

router.put('/quizzes/:id', protect, authorize('teacher', 'registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const totalPoints = (req.body.questions || []).reduce((sum, q) => sum + (q.points || 1), 0);
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, { ...req.body, totalPoints }, { new: true });
  res.json({ success: true, quiz });
}));

// Start & Submit Quiz Attempt
router.post('/quizzes/:id/start', protect, authorize('student'), asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz || !quiz.isPublished) return res.status(404).json({ success: false, message: 'Quiz not available.' });

  const attemptCount = await QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user._id });
  if (attemptCount >= quiz.allowedAttempts) {
    return res.status(400).json({ success: false, message: 'Maximum attempts reached.' });
  }

  const attempt = await QuizAttempt.create({
    schoolId: req.user.schoolId,
    quiz: quiz._id,
    student: req.user._id,
    attemptNumber: attemptCount + 1,
    startedAt: new Date(),
  });

  res.json({ success: true, attempt, quiz });
}));

router.post('/quizzes/:id/submit', protect, authorize('student'), asyncHandler(async (req, res) => {
  const { attemptId, answers } = req.body;
  const quiz = await Quiz.findById(req.params.id);
  const attempt = await QuizAttempt.findById(attemptId);

  if (!attempt || attempt.student.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Invalid attempt.' });
  }

  let score = 0;
  const gradedAnswers = answers.map(a => {
    const question = quiz.questions.id(a.questionId);
    if (!question) return a;
    let isCorrect = false;
    const correct = question.correctAnswer;

    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      isCorrect = a.answer?.toString() === correct?.toString();
    } else if (question.type === 'matching') {
      isCorrect = JSON.stringify(a.answer) === JSON.stringify(correct);
    }
    // essay / short_answer: manual grading
    const pointsEarned = isCorrect ? (question.points || 1) : 0;
    if (isCorrect) score += pointsEarned;
    return { ...a, isCorrect, pointsEarned };
  });

  const percentage = quiz.totalPoints > 0 ? (score / quiz.totalPoints) * 100 : 0;
  const timeTaken = Math.floor((new Date() - attempt.startedAt) / 1000);

  await QuizAttempt.findByIdAndUpdate(attemptId, {
    answers: gradedAnswers, score, totalPoints: quiz.totalPoints,
    percentage, isPassed: percentage >= quiz.passingScore,
    submittedAt: new Date(), timeTaken, status: 'submitted',
  });

  const updated = await QuizAttempt.findById(attemptId);
  res.json({ success: true, attempt: updated, score, percentage, isPassed: updated.isPassed });
}));

router.get('/quizzes/:id/attempts', protect, asyncHandler(async (req, res) => {
  const filter = { quiz: req.params.id };
  if (req.user.role === 'student') filter.student = req.user._id;
  const attempts = await QuizAttempt.find(filter)
    .populate('student', 'firstName lastName studentId avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, attempts });
}));

// ---- ASSIGNMENTS ----
router.get('/assignments', protect, asyncHandler(async (req, res) => {
  const { scheduleId } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (scheduleId) filter.scheduleId = scheduleId;
  if (req.user.role === 'teacher') filter.teacher = req.user._id;
  if (req.user.role === 'student') filter.isPublished = true;

  const assignments = await Assignment.find(filter)
    .populate('teacher', 'firstName lastName')
    .sort({ dueDate: 1 });
  res.json({ success: true, assignments });
}));

router.post('/assignments', protect, authorize('teacher', 'registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const assignment = await Assignment.create({
    ...req.body,
    schoolId: req.user.schoolId,
    teacher: req.user._id,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, assignment });
}));

router.put('/assignments/:id', protect, authorize('teacher', 'registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, assignment });
}));

// Submit assignment
router.post('/assignments/:id/submit', protect, authorize('student'), asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

  const existing = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
  if (existing) return res.status(400).json({ success: false, message: 'Already submitted.' });

  const isLate = new Date() > new Date(assignment.dueDate);
  const submission = await Submission.create({
    ...req.body,
    schoolId: req.user.schoolId,
    assignment: assignment._id,
    student: req.user._id,
    isLate,
  });

  // Notify teacher
  await Notification.create({
    schoolId: req.user.schoolId,
    recipient: assignment.teacher,
    sender: req.user._id,
    title: 'New Assignment Submission',
    message: `${req.user.firstName} ${req.user.lastName} submitted "${assignment.title}"${isLate ? ' (LATE)' : ''}.`,
    type: 'reminder',
  });

  res.status(201).json({ success: true, submission });
}));

// Grade submission
router.put('/submissions/:id/grade', protect, authorize('teacher', 'registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const submission = await Submission.findByIdAndUpdate(req.params.id, {
    score: req.body.score, feedback: req.body.feedback,
    gradedBy: req.user._id, gradedAt: new Date(), status: 'graded',
  }, { new: true }).populate('student', 'firstName email _id');

  await Notification.create({
    schoolId: req.user.schoolId,
    recipient: submission.student._id,
    title: 'Assignment Graded',
    message: `Your submission has been graded. Score: ${req.body.score}.`,
    type: 'grade',
  });

  res.json({ success: true, submission });
}));

router.get('/assignments/:id/submissions', protect, asyncHandler(async (req, res) => {
  const filter = { assignment: req.params.id };
  if (req.user.role === 'student') filter.student = req.user._id;
  const submissions = await Submission.find(filter)
    .populate('student', 'firstName lastName studentId avatar')
    .populate('gradedBy', 'firstName lastName')
    .sort({ submittedAt: -1 });
  res.json({ success: true, submissions });
}));

// ---- DISCUSSIONS ----
router.get('/discussions', protect, asyncHandler(async (req, res) => {
  const { scheduleId } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (scheduleId) filter.scheduleId = scheduleId;

  const discussions = await Discussion.find(filter)
    .populate('author', 'firstName lastName avatar role')
    .sort({ isPinned: -1, createdAt: -1 });
  res.json({ success: true, discussions });
}));

router.post('/discussions', protect, asyncHandler(async (req, res) => {
  const discussion = await Discussion.create({
    ...req.body,
    schoolId: req.user.schoolId,
    author: req.user._id,
  });
  res.status(201).json({ success: true, discussion });
}));

router.post('/discussions/:id/reply', protect, asyncHandler(async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(req.params.id, {
    $push: {
      replies: {
        author: req.user._id,
        content: req.body.content,
        attachments: req.body.attachments || [],
      },
    },
  }, { new: true }).populate('replies.author', 'firstName lastName avatar role');

  // Notify original poster
  if (discussion.author.toString() !== req.user._id.toString()) {
    await Notification.create({
      schoolId: req.user.schoolId,
      recipient: discussion.author,
      sender: req.user._id,
      title: 'New Reply on Your Post',
      message: `${req.user.firstName} replied to "${discussion.title}".`,
      type: 'message',
    });
  }

  res.json({ success: true, discussion });
}));

router.post('/discussions/:id/pin', protect, authorize('teacher', 'registrar', 'principal', 'super_admin'), asyncHandler(async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(req.params.id, { isPinned: !req.body.pinned }, { new: true });
  res.json({ success: true, discussion });
}));

// ---- PROGRESS ----
router.get('/progress/:scheduleId', protect, asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const filter = { scheduleId };
  if (req.user.role === 'student') filter.student = req.user._id;

  const [lessons, quizzes, assignments] = await Promise.all([
    Lesson.find({ scheduleId, schoolId: req.user.schoolId, isPublished: true }).select('_id completions'),
    Quiz.find({ scheduleId, schoolId: req.user.schoolId, isPublished: true }).select('_id'),
    Assignment.find({ scheduleId, schoolId: req.user.schoolId, isPublished: true }).select('_id'),
  ]);

  // For student: their own progress
  if (req.user.role === 'student') {
    const completedLessons = lessons.filter(l => l.completions?.some(c => c.student.toString() === req.user._id.toString())).length;
    const [takenQuizzes, submittedAssignments] = await Promise.all([
      QuizAttempt.countDocuments({ student: req.user._id, quiz: { $in: quizzes.map(q => q._id) }, status: { $in: ['submitted', 'graded'] } }),
      Submission.countDocuments({ student: req.user._id, assignment: { $in: assignments.map(a => a._id) } }),
    ]);
    const total = lessons.length + quizzes.length + assignments.length;
    const completed = completedLessons + takenQuizzes + submittedAssignments;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return res.json({ success: true, progress, completedLessons, takenQuizzes, submittedAssignments, totalLessons: lessons.length, totalQuizzes: quizzes.length, totalAssignments: assignments.length });
  }

  // For teachers/admin: class-level stats
  const submissions = await Submission.countDocuments({ assignment: { $in: assignments.map(a => a._id) } });
  const attempts = await QuizAttempt.countDocuments({ quiz: { $in: quizzes.map(q => q._id) }, status: { $ne: 'in_progress' } });
  res.json({ success: true, totalLessons: lessons.length, totalQuizzes: quizzes.length, totalAssignments: assignments.length, totalSubmissions: submissions, totalAttempts: attempts });
}));

module.exports = router;
