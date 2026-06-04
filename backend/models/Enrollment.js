const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' },
  enrollmentNumber: { type: String, unique: true },
  academicYear: { type: String, required: true },
  semester: { type: String, enum: ['1st','2nd','Summer'], required: true },
  
  type: { type: String, enum: ['new','returning','transferee','returnee','cross_enrollee'], default: 'returning' },
  levelType: { type: String, enum: ['k12','college'], default: 'college' },
  campus: { type: mongoose.Schema.Types.ObjectId, ref: 'CampusLocation' },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  yearLevel: { type: Number },
  gradeLevel: { type: String },
  section: { type: String },
  
  status: {
    type: String,
    enum: ['pending','under_review','for_assessment','assessed','for_payment','payment_pending','enrolled','cancelled','rejected'],
    default: 'pending',
  },

  subjects: [{
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSchedule' },
    units: Number,
    status: { type: String, enum: ['enrolled','dropped','withdrawn'], default: 'enrolled' },
  }],
  totalUnits: { type: Number, default: 0 },

  // Workflow steps
  steps: [{
    step: { type: String, enum: ['application','verification','assessment','payment','subject_assignment','confirmation'] },
    status: { type: String, enum: ['pending','completed','failed'], default: 'pending' },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
    remarks: String,
  }],

  // Documents submitted
  documents: [{
    type: { type: String },
    url: String, verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],

  // Assessment
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  totalFees: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  
  remarks: String,
  enrolledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  confirmedAt: Date,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: Date,
  cancellationReason: String,
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

enrollmentSchema.pre('save', async function () {
  if (!this.enrollmentNumber) {
    const count = await this.constructor.countDocuments({ schoolId: this.schoolId });
    const year = new Date().getFullYear().toString().slice(-2);
    this.enrollmentNumber = `ENR-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
