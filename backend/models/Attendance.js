const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSchedule' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present','absent','late','excused','half_day'], default: 'present' },
  timeIn: { type: Date },
  timeOut: { type: Date },
  method: { type: String, enum: ['manual','qr_code','rfid','nfc','biometric'], default: 'manual' },
  remarks: { type: String },
  excuseDocument: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

attendanceSchema.index({ student: 1, date: 1, schedule: 1 });

// ---- Daily Attendance (School-wide) ----
const dailyAttendanceSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  date: { type: Date, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['present','absent','late','excused','half_day'], default: 'present' },
  timeIn: Date, timeOut: Date,
  method: { type: String, enum: ['manual','qr_code','rfid','nfc','biometric'], default: 'manual' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

dailyAttendanceSchema.index({ schoolId: 1, date: 1, student: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
const DailyAttendance = mongoose.model('DailyAttendance', dailyAttendanceSchema);

module.exports = { Attendance, DailyAttendance };
