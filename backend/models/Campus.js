const mongoose = require('mongoose');

// Teacher/Employee Profile
const employeeProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  employeeId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['teaching','non_teaching'], default: 'teaching' },
  position: { type: String },
  department: { type: String },
  specialization: [String],
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  
  employment: {
    status: { type: String, enum: ['regular','probationary','contractual','part_time','consultant'], default: 'regular' },
    startDate: Date,
    endDate: Date,
    contractUrl: String,
    salary: { basic: Number, allowances: Number, deductions: Number },
    paySchedule: { type: String, enum: ['monthly','semi_monthly','bi_weekly','weekly'] },
  },

  education: [{
    degree: String, course: String, school: String, year: String, honors: String,
  }],
  
  licenses: [{
    name: String, number: String, issueDate: Date, expiryDate: Date, issuingBody: String, documentUrl: String,
  }],
  
  certifications: [{
    name: String, issueDate: Date, expiryDate: Date, issuingBody: String, documentUrl: String,
  }],

  performance: [{
    academicYear: String, rating: Number, remarks: String, evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, date: Date,
  }],

  documents: [{
    type: String, url: String, publicId: String, uploadedAt: { type: Date, default: Date.now },
  }],

  maxTeachingLoad: { type: Number, default: 21 }, // units
  currentLoad: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Room
const roomSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  building: { type: String },
  floor: { type: Number },
  type: { type: String, enum: ['classroom','laboratory','library','gym','office','auditorium','cafeteria','clinic','other'] },
  capacity: { type: Number, default: 40 },
  facilities: [String],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Asset
const assetSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  code: { type: String },
  type: { type: String, enum: ['computer','projector','furniture','equipment','vehicle','book','other'] },
  brand: String, model: String, serialNumber: String,
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  status: { type: String, enum: ['good','for_repair','under_repair','disposed'], default: 'good' },
  purchaseDate: Date, purchaseCost: Number, warrantyExpiry: Date,
  maintenanceHistory: [{ date: Date, description: String, cost: Number, performedBy: String }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Audit Log
const auditLogSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  module: { type: String },
  resourceType: String,
  resourceId: mongoose.Schema.Types.ObjectId,
  description: String,
  oldValues: mongoose.Schema.Types.Mixed,
  newValues: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String,
  status: { type: String, enum: ['success','failure'], default: 'success' },
}, { timestamps: true });

const EmployeeProfile = mongoose.model('EmployeeProfile', employeeProfileSchema);
const Room = mongoose.model('Room', roomSchema);
const Asset = mongoose.model('Asset', assetSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = { EmployeeProfile, Room, Asset, AuditLog };
