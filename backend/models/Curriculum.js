const mongoose = require('mongoose');

const curriculumSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  name: { type: String, required: true },
  code: { type: String },
  version: { type: String, default: '1.0' },
  effectiveYear: { type: String },
  status: { type: String, enum: ['draft','active','archived'], default: 'draft' },
  description: { type: String },
  subjects: [{
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    yearLevel: { type: Number }, // 1-4 for college
    semester: { type: String, enum: ['1st','2nd','Summer','1st Semester','2nd Semester'] },
    gradeLevel: { type: String }, // for K-12
    isRequired: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  }],
  totalUnits: { type: Number },
  revisions: [{
    version: String, changes: String, revisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, date: { type: Date, default: Date.now },
  }],
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Curriculum', curriculumSchema);
