const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSchedule' },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
  academicYear: { type: String, required: true },
  semester: { type: String, enum: ['1st','2nd','Summer'], required: true },

  // Grade components
  components: [{
    name: String, // e.g. "Quiz 1", "Midterm Exam"
    category: { type: String, enum: ['quiz','activity','assignment','project','exam','participation','other'] },
    weight: Number, // percentage weight
    score: Number,
    maxScore: Number,
    date: Date,
    remarks: String,
  }],

  // Computed grades
  quizAverage: { type: Number, default: 0 },
  activityAverage: { type: Number, default: 0 },
  assignmentAverage: { type: Number, default: 0 },
  projectAverage: { type: Number, default: 0 },

  // Period grades
  prelimGrade: { type: Number },
  midtermGrade: { type: Number },
  finalGrade: { type: Number },
  
  // Final computed
  rawFinalGrade: { type: Number },
  finalRating: { type: Number },
  equivalentGrade: { type: String }, // 1.0, 1.25... or A, B, C
  remarks: { type: String, enum: ['Passed','Failed','Incomplete','Dropped','Withdrawn','INC','IP'] },
  
  // Grading weights config (snapshot at time of encoding)
  gradingWeights: {
    quiz: { type: Number, default: 20 },
    activity: { type: Number, default: 10 },
    assignment: { type: Number, default: 10 },
    project: { type: Number, default: 20 },
    exam: { type: Number, default: 40 },
  },

  // Approval workflow
  status: { type: String, enum: ['draft','submitted','approved','released'], default: 'draft' },
  submittedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  releasedAt: Date,
  
  incompleteReason: String,
  incompleteDeadline: Date,
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

gradeSchema.index({ student: 1, subject: 1, academicYear: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
