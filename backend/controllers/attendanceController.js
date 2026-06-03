const { asyncHandler } = require('../middleware/errorHandler');
const { Attendance, DailyAttendance } = require('../models/Attendance');
const ClassSchedule = require('../models/ClassSchedule');
const User = require('../models/User');
const qrcode = require('qrcode');
const { Notification } = require('../models/Communication');

const getAttendance = asyncHandler(async (req, res) => {
  const { scheduleId, studentId, date, startDate, endDate, status, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (scheduleId) filter.schedule = scheduleId;
  if (studentId) filter.student = studentId;
  if (status) filter.status = status;
  if (date) filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) };
  else if (startDate && endDate) filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

  if (req.user.role === 'student') filter.student = req.user._id;
  else if (req.user.role === 'teacher') filter.teacher = req.user._id;

  const total = await Attendance.countDocuments(filter);
  const records = await Attendance.find(filter)
    .populate('student', 'firstName lastName studentId avatar')
    .populate('subject', 'name code')
    .populate('recordedBy', 'firstName lastName')
    .skip((page - 1) * limit).limit(Number(limit))
    .sort({ date: -1 });

  res.json({ success: true, total, records });
});

const markAttendance = asyncHandler(async (req, res) => {
  const { scheduleId, date, attendanceRecords } = req.body;
  // attendanceRecords: [{ student, status, timeIn, timeOut, remarks }]

  const schedule = await ClassSchedule.findById(scheduleId);
  if (!schedule) return res.status(404).json({ success: false, message: 'Class not found.' });
  if (schedule.teacher.toString() !== req.user._id.toString() && !['registrar','principal','super_admin','school_owner'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const results = [];
  for (const rec of attendanceRecords) {
    const existing = await Attendance.findOne({ student: rec.student, schedule: scheduleId, date: { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) } });
    if (existing) {
      existing.status = rec.status;
      existing.remarks = rec.remarks;
      await existing.save();
      results.push(existing);
    } else {
      const att = await Attendance.create({
        schoolId: req.user.schoolId, student: rec.student, schedule: scheduleId,
        subject: schedule.subject, teacher: req.user._id,
        date: new Date(date), status: rec.status,
        timeIn: rec.timeIn, timeOut: rec.timeOut,
        remarks: rec.remarks, method: req.body.method || 'manual',
        recordedBy: req.user._id,
      });
      results.push(att);
    }

    // Alert parent if absent
    if (rec.status === 'absent') {
      const student = await User.findById(rec.student).select('parentOf');
      if (student?.parentOf?.length) {
        for (const parentId of student.parentOf) {
          await Notification.create({
            schoolId: req.user.schoolId, recipient: parentId,
            title: 'Attendance Alert', message: `Your child was marked absent on ${new Date(date).toLocaleDateString()}.`,
            type: 'attendance', priority: 'high',
          });
        }
      }
    }
  }

  res.json({ success: true, message: 'Attendance recorded.', count: results.length });
});

const markQRAttendance = asyncHandler(async (req, res) => {
  const { qrData, scheduleId, date } = req.body;
  let studentId;
  try {
    const parsed = JSON.parse(qrData);
    studentId = parsed.userId || parsed.studentId;
  } catch {
    studentId = qrData;
  }

  const student = await User.findOne({ $or: [{ _id: studentId }, { studentId }] });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

  const att = await Attendance.findOneAndUpdate(
    { student: student._id, schedule: scheduleId, date: { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) } },
    { $set: { status: 'present', timeIn: new Date(), method: 'qr_code', recordedBy: req.user._id } },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: `Attendance marked for ${student.firstName} ${student.lastName}`, attendance: att });
});

const generateStudentQR = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.studentId).select('firstName lastName studentId _id');
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

  const qrData = JSON.stringify({ userId: student._id, studentId: student.studentId, name: `${student.firstName} ${student.lastName}` });
  const qrCode = await qrcode.toDataURL(qrData);
  res.json({ success: true, qrCode, student });
});

const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { scheduleId, studentId, academicYear, semester } = req.query;
  const filter = {};
  if (scheduleId) filter.schedule = scheduleId;
  if (studentId) filter.student = studentId;
  if (req.user.role === 'student') filter.student = req.user._id;

  const records = await Attendance.find(filter);
  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const excused = records.filter(r => r.status === 'excused').length;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  res.json({ success: true, summary: { total, present, absent, late, excused, attendanceRate } });
});

module.exports = { getAttendance, markAttendance, markQRAttendance, generateStudentQR, getAttendanceSummary };
