const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { HealthRecord } = require('../models/Services');
const StudentProfile = require('../models/StudentProfile');
const { Notification } = require('../models/Communication');
const User = require('../models/User');

const CLINIC_ROLES = ['nurse', 'principal', 'super_admin', 'school_owner'];

// ---- CLINIC VISITS ----
router.get('/records', protect, authorize(...CLINIC_ROLES), asyncHandler(async (req, res) => {
  const { date, disposition, search, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (disposition) filter.disposition = disposition;
  if (date) {
    const d = new Date(date);
    filter.visitDate = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  }

  let records = await HealthRecord.find(filter)
    .populate('student', 'firstName lastName studentId avatar role')
    .populate('attendedBy', 'firstName lastName')
    .skip((page - 1) * limit).limit(Number(limit))
    .sort({ visitDate: -1 });

  if (search) {
    const s = search.toLowerCase();
    records = records.filter(r =>
      r.student?.firstName?.toLowerCase().includes(s) ||
      r.student?.lastName?.toLowerCase().includes(s)
    );
  }

  const total = await HealthRecord.countDocuments(filter);
  res.json({ success: true, total, records });
}));

router.get('/records/my', protect, asyncHandler(async (req, res) => {
  const records = await HealthRecord.find({ student: req.user._id, schoolId: req.user.schoolId })
    .populate('attendedBy', 'firstName lastName')
    .sort({ visitDate: -1 }).limit(20);
  res.json({ success: true, records });
}));

router.post('/records', protect, authorize(...CLINIC_ROLES), asyncHandler(async (req, res) => {
  const record = await HealthRecord.create({
    ...req.body,
    schoolId: req.user.schoolId,
    attendedBy: req.user._id,
  });

  // If sent home or hospitalized, notify parents
  if (['sent_home', 'hospitalized'].includes(req.body.disposition)) {
    const student = await User.findById(req.body.student).populate('parentOf', 'firstName _id');
    if (student?.parentOf?.length) {
      for (const parent of student.parentOf) {
        await Notification.create({
          schoolId: req.user.schoolId,
          recipient: parent._id,
          title: `⚕️ Clinic Alert - ${student.firstName} ${student.lastName}`,
          message: `Your child visited the clinic. Diagnosis: ${req.body.diagnosis || 'N/A'}. Disposition: ${req.body.disposition?.replace(/_/g, ' ')}.`,
          type: 'alert',
          priority: req.body.disposition === 'hospitalized' ? 'urgent' : 'high',
        });
      }
    }
  }

  const populated = await HealthRecord.findById(record._id).populate('student', 'firstName lastName studentId').populate('attendedBy', 'firstName lastName');
  res.status(201).json({ success: true, record: populated });
}));

router.put('/records/:id', protect, authorize(...CLINIC_ROLES), asyncHandler(async (req, res) => {
  const record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('student', 'firstName lastName')
    .populate('attendedBy', 'firstName lastName');
  res.json({ success: true, record });
}));

// Student medical profile (from StudentProfile)
router.get('/profile/:studentId', protect, authorize(...CLINIC_ROLES), asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.params.studentId, schoolId: req.user.schoolId })
    .populate('userId', 'firstName lastName birthDate gender');
  res.json({ success: true, profile });
}));

router.put('/profile/:studentId', protect, authorize(...CLINIC_ROLES), asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOneAndUpdate(
    { userId: req.params.studentId },
    {
      medicalHistory: req.body.medicalHistory,
      vaccinations: req.body.vaccinations,
      allergies: req.body.allergies,
      bloodType: req.body.bloodType,
      height: req.body.height,
      weight: req.body.weight,
      updatedBy: req.user._id,
    },
    { new: true }
  );
  res.json({ success: true, profile });
}));

// Analytics
router.get('/summary', protect, authorize(...CLINIC_ROLES), asyncHandler(async (req, res) => {
  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayVisits, monthVisits, byDisposition, topDiagnoses] = await Promise.all([
    HealthRecord.countDocuments({ schoolId: req.user.schoolId, visitDate: { $gte: today } }),
    HealthRecord.countDocuments({ schoolId: req.user.schoolId, visitDate: { $gte: thisMonth } }),
    HealthRecord.aggregate([
      { $match: { schoolId: req.user.schoolId, visitDate: { $gte: thisMonth } } },
      { $group: { _id: '$disposition', count: { $sum: 1 } } },
    ]),
    HealthRecord.aggregate([
      { $match: { schoolId: req.user.schoolId, visitDate: { $gte: thisMonth } } },
      { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]),
  ]);

  res.json({ success: true, todayVisits, monthVisits, byDisposition, topDiagnoses });
}));

module.exports = router;
