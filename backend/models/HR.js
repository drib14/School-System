const mongoose = require('mongoose');

// Payroll Run (batch for a period)
const payrollRunSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true }, // e.g. "March 2025 Semi-Monthly 1st"
  period: {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
  },
  payDate: { type: Date, required: true },
  type: { type: String, enum: ['monthly', 'semi_monthly', 'bi_weekly', 'weekly'], required: true },
  status: { type: String, enum: ['draft', 'processing', 'approved', 'released', 'cancelled'], default: 'draft' },
  totalGross: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  totalNet: { type: Number, default: 0 },
  employeeCount: { type: Number, default: 0 },
  notes: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  releasedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Individual Payslip
const payslipSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  payrollRun: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollRun', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  period: { from: Date, to: Date },
  payDate: Date,

  earnings: {
    basicSalary: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    holidayPay: { type: Number, default: 0 },
    allowances: {
      transportation: { type: Number, default: 0 },
      meal: { type: Number, default: 0 },
      rice: { type: Number, default: 0 },
      clothing: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    bonuses: { type: Number, default: 0 },
    thirteenthMonth: { type: Number, default: 0 },
    otherEarnings: [{ label: String, amount: Number }],
  },

  deductions: {
    sss: { type: Number, default: 0 },
    philhealth: { type: Number, default: 0 },
    pagibig: { type: Number, default: 0 },
    withholdingTax: { type: Number, default: 0 },
    sssLoan: { type: Number, default: 0 },
    pagibigLoan: { type: Number, default: 0 },
    absences: { type: Number, default: 0 },
    lates: { type: Number, default: 0 },
    otherDeductions: [{ label: String, amount: Number }],
  },

  workDays: { required: Number, worked: Number, absent: Number, late: Number },

  grossPay: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netPay: { type: Number, default: 0 },

  status: { type: String, enum: ['draft', 'approved', 'released'], default: 'draft' },
  payslipUrl: String, // generated PDF
}, { timestamps: true });

// Leave Request
const leaveRequestSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, enum: ['vacation', 'sick', 'emergency', 'maternity', 'paternity', 'special', 'without_pay'], required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  documents: [{ name: String, url: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  remarks: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
}, { timestamps: true });

// Leave Balance per employee per year
const leaveBalanceSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  vacation: { total: { type: Number, default: 15 }, used: { type: Number, default: 0 }, remaining: { type: Number, default: 15 } },
  sick: { total: { type: Number, default: 15 }, used: { type: Number, default: 0 }, remaining: { type: Number, default: 15 } },
  emergency: { total: { type: Number, default: 3 }, used: { type: Number, default: 0 }, remaining: { type: Number, default: 3 } },
}, { timestamps: true });

// Job Posting
const jobPostingSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  title: { type: String, required: true },
  department: String,
  type: { type: String, enum: ['teaching', 'non_teaching'], required: true },
  employmentType: { type: String, enum: ['regular', 'part_time', 'contractual'], default: 'regular' },
  description: { type: String, required: true },
  requirements: [String],
  qualifications: String,
  salaryRange: { min: Number, max: Number },
  slots: { type: Number, default: 1 },
  deadline: Date,
  status: { type: String, enum: ['open', 'closed', 'on_hold'], default: 'open' },
  isPublic: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Job Applicant
const applicantSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  address: String,
  resumeUrl: String,
  coverLetterUrl: String,
  applicationDate: { type: Date, default: Date.now },
  stage: { type: String, enum: ['applied', 'screening', 'exam', 'interview', 'job_offer', 'hired', 'rejected', 'withdrawn'], default: 'applied' },
  examScore: Number,
  interviewDate: Date,
  interviewNotes: String,
  offerDetails: { salary: Number, startDate: Date, position: String },
  status: { type: String, enum: ['active', 'hired', 'rejected', 'withdrawn'], default: 'active' },
  remarks: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Performance Evaluation
const evaluationSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  evaluator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true },
  semester: String,
  period: { from: Date, to: Date },
  type: { type: String, enum: ['mid_year', 'annual', 'probationary', 'special'] },
  criteria: [{
    category: String,
    items: [{ description: String, weight: Number, rating: Number, remarks: String }],
    subtotal: Number,
  }],
  totalRating: { type: Number, default: 0 },
  interpretation: { type: String, enum: ['outstanding', 'very_satisfactory', 'satisfactory', 'unsatisfactory', 'poor'] },
  strengths: String,
  areasForImprovement: String,
  recommendations: String,
  status: { type: String, enum: ['draft', 'submitted', 'acknowledged', 'finalized'], default: 'draft' },
  acknowledgedAt: Date,
  finalizedAt: Date,
}, { timestamps: true });

const PayrollRun = mongoose.model('PayrollRun', payrollRunSchema);
const Payslip = mongoose.model('Payslip', payslipSchema);
const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);
const JobPosting = mongoose.model('JobPosting', jobPostingSchema);
const Applicant = mongoose.model('Applicant', applicantSchema);
const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = { PayrollRun, Payslip, LeaveRequest, LeaveBalance, JobPosting, Applicant, Evaluation };
