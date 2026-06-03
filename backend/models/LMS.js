const mongoose = require('mongoose');

// Lesson
const lessonSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  content: { type: String }, // rich text HTML
  type: { type: String, enum: ['lecture', 'video', 'reading', 'activity', 'lab', 'other'], default: 'lecture' },
  weekNumber: { type: Number },
  order: { type: Number, default: 0 },
  attachments: [{
    name: String, url: String, publicId: String,
    fileType: { type: String, enum: ['pdf', 'doc', 'ppt', 'video', 'image', 'link', 'other'] },
    size: Number,
  }],
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  views: { type: Number, default: 0 },
  completions: [{ student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, completedAt: Date }],
  academicYear: String,
  semester: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Quiz
const quizQuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching'], required: true },
  question: { type: String, required: true },
  options: [{ label: String, value: String }], // for multiple choice
  correctAnswer: mongoose.Schema.Types.Mixed, // string or array
  points: { type: Number, default: 1 },
  explanation: String,
  imageUrl: String,
  order: { type: Number, default: 0 },
});

const quizSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['quiz', 'exam', 'activity', 'assignment'], default: 'quiz' },
  questions: [quizQuestionSchema],
  totalPoints: { type: Number, default: 0 },
  passingScore: { type: Number, default: 60 }, // percentage
  timeLimit: { type: Number }, // minutes, null = no limit
  allowedAttempts: { type: Number, default: 1 },
  shuffleQuestions: { type: Boolean, default: false },
  shuffleOptions: { type: Boolean, default: false },
  showResultImmediately: { type: Boolean, default: true },
  openAt: Date,
  closeAt: Date,
  isPublished: { type: Boolean, default: false },
  academicYear: String,
  semester: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Quiz Attempt
const quizAttemptSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: Number,
  }],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  isPassed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  timeTaken: Number, // seconds
  attemptNumber: { type: Number, default: 1 },
  status: { type: String, enum: ['in_progress', 'submitted', 'graded'], default: 'in_progress' },
  feedback: String, // teacher feedback
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: Date,
}, { timestamps: true });

// Assignment
const assignmentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructions: String,
  attachments: [{ name: String, url: String, publicId: String }],
  maxScore: { type: Number, default: 100 },
  passingScore: { type: Number, default: 60 },
  dueDate: { type: Date, required: true },
  allowLateSubmission: { type: Boolean, default: false },
  latePenalty: { type: Number, default: 0 }, // points deducted per day late
  submissionType: { type: String, enum: ['file', 'text', 'link', 'any'], default: 'any' },
  allowedFileTypes: [String],
  maxFileSize: { type: Number, default: 10 }, // MB
  isPublished: { type: Boolean, default: false },
  academicYear: String,
  semester: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Assignment Submission
const submissionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  textContent: String,
  link: String,
  files: [{ name: String, url: String, publicId: String, size: Number, type: String }],
  submittedAt: { type: Date, default: Date.now },
  isLate: { type: Boolean, default: false },
  status: { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' },
  score: Number,
  feedback: String,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: Date,
}, { timestamps: true });

// Discussion
const discussionReplySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [{ name: String, url: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const discussionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  attachments: [{ name: String, url: String }],
  replies: [discussionReplySchema],
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isClosed: { type: Boolean, default: false },
  academicYear: String,
  semester: String,
}, { timestamps: true });

// Learning Progress
const learningProgressSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
  lessonsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  quizzesTaken: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt' }],
  assignmentsSubmitted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
  overallProgress: { type: Number, default: 0 }, // percentage
  lastActivity: Date,
  academicYear: String,
  semester: String,
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Submission = mongoose.model('Submission', submissionSchema);
const Discussion = mongoose.model('Discussion', discussionSchema);
const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);

module.exports = { Lesson, Quiz, QuizAttempt, Assignment, Submission, Discussion, LearningProgress };
