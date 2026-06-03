const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  units: { type: Number, required: true, default: 3 },
  labUnits: { type: Number, default: 0 },
  lecUnits: { type: Number, default: 3 },
  creditHours: { type: Number },
  category: { type: String, enum: ['core','major','minor','elective','specialized','nstp','pe','other'] },
  type: { type: String, enum: ['lecture','laboratory','lecture_lab'] },
  level: { type: String, enum: ['k12','college','both'], default: 'college' },
  gradeLevel: [String],
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  corequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  program: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
  curriculum: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' }],
  department: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

subjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
