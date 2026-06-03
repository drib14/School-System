const mongoose = require('mongoose');

// Library Book
const bookSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  isbn: { type: String },
  title: { type: String, required: true },
  author: [String],
  publisher: String, publishedYear: Number,
  edition: String, genre: String,
  category: { type: String, enum: ['textbook','reference','fiction','non_fiction','journal','thesis','periodical','other'] },
  subject: String, language: { type: String, default: 'English' },
  copies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  location: String, shelfNumber: String,
  coverUrl: String,
  description: String,
  tags: [String],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Library Borrow Record
const borrowRecordSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  status: { type: String, enum: ['borrowed','returned','overdue','lost'], default: 'borrowed' },
  fine: { type: Number, default: 0 },
  finePaid: { type: Boolean, default: false },
  condition: { type: String, enum: ['good','damaged','lost'] },
  notes: String,
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  returnedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Visitor
const visitorSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  firstName: String, lastName: String,
  phone: String, email: String,
  purpose: String, personToVisit: String,
  department: String,
  idType: String, idNumber: String,
  photo: String,
  qrCode: String,
  vehiclePlate: String,
  timeIn: { type: Date, default: Date.now },
  timeOut: Date,
  status: { type: String, enum: ['checked_in','checked_out'], default: 'checked_in' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: String,
}, { timestamps: true });

// Gate Pass
const gatePassSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  personType: { type: String, enum: ['student','employee','visitor'] },
  passNumber: { type: String, unique: true },
  reason: { type: String, required: true },
  destination: String,
  timeOut: { type: Date, default: Date.now },
  expectedReturn: Date,
  actualReturn: Date,
  status: { type: String, enum: ['pending','approved','rejected','returned'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  qrCode: String,
}, { timestamps: true });

// Incident Report
const incidentReportSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  reportNumber: { type: String, unique: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['behavioral','academic','physical','cyberbullying','vandalism','theft','drug','other'] },
  severity: { type: String, enum: ['minor','moderate','major','critical'], default: 'minor' },
  description: { type: String, required: true },
  witnesses: [String],
  location: String,
  dateTime: { type: Date, default: Date.now },
  actionTaken: String,
  status: { type: String, enum: ['open','under_investigation','resolved','closed'], default: 'open' },
  attachments: [{ url: String, name: String }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  investigatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
}, { timestamps: true });

// Health Record
const healthRecordSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitDate: { type: Date, default: Date.now },
  chiefComplaint: String,
  diagnosis: String,
  treatment: String,
  medications: [{ name: String, dosage: String, frequency: String }],
  vitalSigns: { temperature: Number, bloodPressure: String, pulse: Number, respiratoryRate: Number, weight: Number, height: Number },
  disposition: { type: String, enum: ['sent_home','referred','treated_in_clinic','hospitalized','returned_to_class'] },
  referredTo: String,
  notes: String,
  attendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Scholarship
const scholarshipSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  code: String,
  type: { type: String, enum: ['full','partial','government','private','athletic','academic','need_based'] },
  coverageType: { type: String, enum: ['percentage','fixed_amount'] },
  coverageValue: Number,
  requirements: [String],
  gpaRequirement: Number,
  incomeRequirement: Number,
  maxSlots: Number,
  currentSlots: { type: Number, default: 0 },
  academicYear: String,
  semester: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Scholarship Application
const scholarshipApplicationSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  scholarship: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending','qualified','approved','rejected','cancelled'], default: 'pending' },
  documents: [{ type: String, url: String, name: String }],
  gpa: Number,
  monthlyIncome: Number,
  essay: String,
  remarks: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  academicYear: String,
  semester: String,
}, { timestamps: true });

// Alumni
const alumniSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  studentId: String,
  firstName: String, middleName: String, lastName: String,
  email: String, phone: String,
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  yearGraduated: Number,
  honors: String,
  currentEmployer: String,
  jobTitle: String,
  industry: String,
  linkedIn: String,
  address: { city: String, province: String, country: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// ---- CLEARANCE ----
const clearanceRequestSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestNumber: { type: String, unique: true },
  type: { type: String, enum: ['semester', 'graduation', 'transfer', 'withdrawal', 'other'], required: true },
  academicYear: { type: String, required: true },
  semester: String,
  purpose: String,
  steps: [{
    office: { type: String, enum: ['registrar', 'accounting', 'library', 'clinic', 'guidance', 'department', 'principal', 'property'], required: true },
    label: String,
    status: { type: String, enum: ['pending', 'cleared', 'with_concern', 'rejected'], default: 'pending' },
    concern: String,
    clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clearedAt: Date,
    remarks: String,
  }],
  overallStatus: { type: String, enum: ['pending', 'in_progress', 'cleared', 'rejected'], default: 'pending' },
  completedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

clearanceRequestSchema.pre('save', async function (next) {
  if (!this.requestNumber) {
    const count = await this.constructor.countDocuments({ schoolId: this.schoolId });
    const year = new Date().getFullYear().toString().slice(-2);
    this.requestNumber = `CLR-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ---- DOCUMENT REQUESTS ----
const documentRequestSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  requestNumber: { type: String, unique: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: { type: String, enum: ['tor', 'form137', 'good_moral', 'enrollment_cert', 'graduation_cert', 'diploma', 'cor', 'honorable_dismissal', 'other'], required: true },
  copies: { type: Number, default: 1 },
  purpose: { type: String, required: true },
  deliveryMode: { type: String, enum: ['pickup', 'mail', 'email'], default: 'pickup' },
  status: { type: String, enum: ['pending', 'processing', 'ready', 'released', 'cancelled'], default: 'pending' },
  processingFee: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  urgency: { type: String, enum: ['regular', 'rush', 'same_day'], default: 'regular' },
  releasedAt: Date,
  releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  attachments: [{ name: String, url: String }],
  esignatureRequired: { type: Boolean, default: false },
  esignedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, signedAt: Date }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

documentRequestSchema.pre('save', async function (next) {
  if (!this.requestNumber) {
    const count = await this.constructor.countDocuments({ schoolId: this.schoolId });
    const year = new Date().getFullYear().toString().slice(-2);
    this.requestNumber = `DOC-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ---- STUDENT ORGANIZATIONS ----
const studentOrgSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  abbreviation: String,
  type: { type: String, enum: ['academic', 'civic', 'sports', 'religious', 'cultural', 'government', 'other'] },
  description: String,
  logoUrl: String,
  adviser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  officers: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    position: String,
    academicYear: String,
  }],
  members: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinDate: Date,
    status: { type: String, enum: ['active', 'inactive', 'resigned'], default: 'active' },
  }],
  academicYear: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ---- OJT / INTERNSHIP ----
const ojtRecordSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  companyAddress: String,
  supervisorName: String,
  supervisorEmail: String,
  supervisorPhone: String,
  department: String,
  startDate: Date,
  endDate: Date,
  requiredHours: { type: Number, default: 600 },
  completedHours: { type: Number, default: 0 },
  dtrLogs: [{
    date: Date,
    timeIn: Date,
    timeOut: Date,
    hoursRendered: Number,
    task: String,
    supervisorInitials: String,
  }],
  weeklyReports: [{
    weekNumber: Number,
    from: Date,
    to: Date,
    narrative: String,
    attachmentUrl: String,
    submittedAt: Date,
    grade: Number,
    feedback: String,
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  companyEvaluation: {
    performanceRating: Number,
    attitude: Number,
    attendance: Number,
    overallRating: Number,
    comments: String,
    submittedAt: Date,
    evaluationUrl: String,
  },
  finalGrade: Number,
  status: { type: String, enum: ['pending', 'active', 'completed', 'failed', 'withdrawn'], default: 'pending' },
  certificateUrl: String,
  academicYear: String,
  semester: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ---- GUIDANCE SESSIONS ----
const guidanceCaseSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  caseNumber: { type: String, unique: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  caseType: { type: String, enum: ['academic', 'behavioral', 'personal', 'career', 'family', 'crisis', 'other'] },
  concern: { type: String, required: true },
  background: String,
  status: { type: String, enum: ['open', 'in_progress', 'closed', 'referred'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  sessions: [{
    date: Date,
    duration: Number, // minutes
    notes: String,
    interventions: [String],
    nextSession: Date,
    conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  interventions: [{ type: String, description: String, date: Date, outcome: String }],
  referrals: [{ referredTo: String, reason: String, date: Date, outcome: String }],
  closedAt: Date,
  closingNotes: String,
  parentNotified: { type: Boolean, default: false },
  parentNotifiedAt: Date,
  isConfidential: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

guidanceCaseSchema.pre('save', async function (next) {
  if (!this.caseNumber) {
    const count = await this.constructor.countDocuments({ schoolId: this.schoolId });
    const year = new Date().getFullYear().toString().slice(-2);
    this.caseNumber = `GC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);
const BorrowRecord = mongoose.model('BorrowRecord', borrowRecordSchema);
const Visitor = mongoose.model('Visitor', visitorSchema);
const GatePass = mongoose.model('GatePass', gatePassSchema);
const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema);
const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
const ScholarshipApplication = mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);
const Alumni = mongoose.model('Alumni', alumniSchema);
const ClearanceRequest = mongoose.model('ClearanceRequest', clearanceRequestSchema);
const DocumentRequest = mongoose.model('DocumentRequest', documentRequestSchema);
const StudentOrg = mongoose.model('StudentOrg', studentOrgSchema);
const OJTRecord = mongoose.model('OJTRecord', ojtRecordSchema);
const GuidanceCase = mongoose.model('GuidanceCase', guidanceCaseSchema);

module.exports = {
  Book, BorrowRecord, Visitor, GatePass, IncidentReport, HealthRecord,
  Scholarship, ScholarshipApplication, Alumni,
  ClearanceRequest, DocumentRequest, StudentOrg, OJTRecord, GuidanceCase,
};
