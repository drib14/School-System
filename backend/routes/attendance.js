const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

router.get('/', protect, ctrl.getAttendance);
router.post('/', protect, authorize('teacher','registrar'), ctrl.markAttendance);
router.post('/qr', protect, ctrl.markQRAttendance);
router.get('/summary', protect, ctrl.getAttendanceSummary);
router.get('/qr/:studentId', protect, ctrl.generateStudentQR);

module.exports = router;
