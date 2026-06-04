const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  studentId: { type: String, required: true, unique: true },
  
  // Academic Info
  gradeLevel: { type: String },
  section: { type: String },
  strand: { type: String }, // K-12
  track: { type: String }, // K-12
  course: { type: String }, // College
  yearLevel: { type: Number }, // College
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  academicStatus: { type: String, enum: ['active','irregular','transferee','returnee','graduated','dropped','archived'], default: 'active' },
  enrollmentStatus: { type: String, enum: ['enrolled','not_enrolled','pending'], default: 'not_enrolled' },

  // Personal
  birthPlace: { type: String },
  citizenship: { type: String, default: 'Filipino' },
  indigenousGroup: { type: String },
  pwdStatus: { type: Boolean, default: false },
  pwdDetails: { type: String },
  seriousIllness: { type: String },

  // Family Background
  father: {
    name: String, occupation: String, employer: String, contactNumber: String, email: String, education: String,
  },
  mother: {
    name: String, occupation: String, employer: String, contactNumber: String, email: String, education: String,
  },
  guardian: {
    name: String, relationship: String, occupation: String, contactNumber: String, email: String, address: String,
  },
  familyMonthlyIncome: { type: String },
  numberOfSiblings: { type: Number },

  // Emergency Contacts
  emergencyContacts: [{
    name: String, relationship: String, phone: String, address: String,
  }],

  // Previous School
  previousSchool: {
    name: String, address: String, yearAttended: String, lastGradeLevel: String, schoolId: String,
  },

  // Documents
  documents: [{
    type: { type: String, enum: ['birth_certificate','report_card','transcript','good_moral','id_picture','medical_certificate','form137','other'] },
    url: String, publicId: String, filename: String, uploadedAt: { type: Date, default: Date.now }, verified: { type: Boolean, default: false },
  }],

  // Medical
  medicalHistory: [{
    condition: String, diagnosis: String, medications: String, date: Date, notes: String,
  }],
  vaccinations: [{ vaccine: String, date: Date, nextDue: Date, administeredBy: String }],
  allergies: [String],
  bloodType: String,
  height: Number,
  weight: Number,

  // Scholarship
  scholarships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' }],

  // Notes
  remarks: { type: String },
  tags: [String],
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

studentProfileSchema.index({ userId: 1 });
studentProfileSchema.index({ schoolId: 1 });
studentProfileSchema.index({ studentId: 1 });
studentProfileSchema.index({ academicStatus: 1, enrollmentStatus: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
