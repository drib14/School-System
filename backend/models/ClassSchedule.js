const mongoose = require('mongoose');

const classScheduleSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  roomName: { type: String },
  section: { type: String, required: true },
  sectionCode: { type: String },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  yearLevel: { type: Number },
  gradeLevel: { type: String },
  semester: { type: String, enum: ['1st','2nd','Summer'], default: '1st' },
  academicYear: { type: String, required: true },
  
  schedule: [{
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    startTime: { type: String }, // "07:30"
    endTime: { type: String },   // "09:00"
    type: { type: String, enum: ['lecture','laboratory'], default: 'lecture' },
  }],

  maxStudents: { type: Number, default: 40 },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  enrolledCount: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['open','closed','cancelled'], default: 'open' },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ClassSchedule', classScheduleSchema);
