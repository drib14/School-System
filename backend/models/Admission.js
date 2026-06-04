const mongoose = require('mongoose');

// Online Application
const applicationSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  applicationNumber: { type: String, unique: true },

  // Applicant Info
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  suffix: String,
  email: { type: String, required: true },
  phone: String,
  birthDate: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: { street: String, city: String, province: String, zipCode: String },

  // Academic Info
  applicationType: { type: String, enum: ['new', 'transferee', 'returnee', 'foreign'], required: true },
  desiredCampus: { type: mongoose.Schema.Types.ObjectId, ref: 'CampusLocation' },
  desiredProgram: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  desiredYearLevel: Number,
  previousSchool: { name: String, address: String, lastGradeLevel: String },
  previousGWA: Number,

  // Documents
  documents: [{
    type: { type: String, enum: ['form138', 'psa_birth', 'good_moral', 'id_picture', 'medical_cert', 'tor', 'honorable_dismissal', 'other'] },
    url: String, publicId: String, filename: String,
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
  }],

  // Tracking
  stage: {
    type: String,
    enum: ['submitted', 'document_review', 'exam_scheduled', 'exam_done', 'interview_scheduled', 'interview_done', 'accepted', 'rejected', 'waitlisted', 'enrolled'],
    default: 'submitted',
  },
  remarks: String,
  priority: { type: String, enum: ['normal', 'priority', 'scholarship'], default: 'normal' },

  // Exam
  entranceExam: { type: mongoose.Schema.Types.ObjectId, ref: 'EntranceExam' },
  examScore: Number,
  examRank: Number,
  examPassed: Boolean,

  // Interview
  interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  interviewScore: Number,
  interviewPassed: Boolean,

  // Decision
  acceptedProgram: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  acceptedYearLevel: Number,
  acceptedAt: Date,
  rejectionReason: String,

  // Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  linkedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // after accepted & enrolled

  academicYear: { type: String, required: true },
  semester: String,
  submittedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

applicationSchema.pre('save', async function () {
  if (!this.applicationNumber) {
    const count = await this.constructor.countDocuments({ schoolId: this.schoolId });
    const year = new Date().getFullYear().toString().slice(-2);
    this.applicationNumber = `APP-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

// Entrance Exam Schedule
const entranceExamSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  title: { type: String, required: true },
  description: String,
  examDate: { type: Date, required: true },
  venue: String,
  capacity: { type: Number, default: 50 },
  enrolledApplicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
  passingScore: Number,
  totalItems: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Interview Schedule
const interviewSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  venue: String,
  type: { type: String, enum: ['in_person', 'online'], default: 'in_person' },
  meetingLink: String,
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
  notes: String,
  score: Number,
  recommendation: { type: String, enum: ['accept', 'reject', 'waitlist', 'pending'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);
const EntranceExam = mongoose.model('EntranceExam', entranceExamSchema);
const Interview = mongoose.model('Interview', interviewSchema);

module.exports = { Application, EntranceExam, Interview };
