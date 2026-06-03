const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['k12','college','vocational'], default: 'college' },
  level: { type: String, enum: ['bachelor','masteral','doctoral','senior_high','junior_high','elementary'] },
  department: { type: String },
  duration: { type: Number, default: 4 }, // years
  totalUnits: { type: Number },
  strand: { type: String }, // for K-12
  track: { type: String }, // for K-12
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
