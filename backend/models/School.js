const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true, default: 'ISCP' },
  tagline: { type: String },
  logo: { type: String },
  favicon: { type: String },
  address: {
    street: String, city: String, province: String, zipCode: String, country: { type: String, default: 'Philippines' },
  },
  contact: { phone: String, email: String, website: String },
  principalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subscription: {
    plan: { type: String, enum: ['trial','basic','standard','premium'], default: 'trial' },
    status: { type: String, enum: ['active','expired','cancelled','suspended'], default: 'active' },
    startDate: Date,
    endDate: Date,
    maxStudents: { type: Number, default: 500 },
    maxTeachers: { type: Number, default: 50 },
  },
  settings: {
    academicYear: { type: String, default: '2025-2026' },
    currentSemester: { type: String, enum: ['1st','2nd','Summer'], default: '1st' },
    gradingSystem: { type: String, enum: ['percentage','letter','gpa'], default: 'percentage' },
    passingGrade: { type: Number, default: 75 },
    currency: { type: String, default: 'PHP' },
    timezone: { type: String, default: 'Asia/Manila' },
    schoolLevel: { type: String, enum: ['k12','college','both'], default: 'both' },
    enableOnlineEnrollment: { type: Boolean, default: true },
    enableParentPortal: { type: Boolean, default: true },
    enableLMS: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);
