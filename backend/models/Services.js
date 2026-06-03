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

const Book = mongoose.model('Book', bookSchema);
const BorrowRecord = mongoose.model('BorrowRecord', borrowRecordSchema);
const Visitor = mongoose.model('Visitor', visitorSchema);
const GatePass = mongoose.model('GatePass', gatePassSchema);
const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema);
const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
const ScholarshipApplication = mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);
const Alumni = mongoose.model('Alumni', alumniSchema);

module.exports = { Book, BorrowRecord, Visitor, GatePass, IncidentReport, HealthRecord, Scholarship, ScholarshipApplication, Alumni };
