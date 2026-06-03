const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/gradeController');

router.get('/', protect, ctrl.getGrades);
router.post('/', protect, authorize('teacher','registrar'), ctrl.createGrade);
router.get('/me', protect, authorize('student'), ctrl.getMyGrades);
router.get('/:id', protect, ctrl.getGrade);
router.put('/:id', protect, authorize('teacher','registrar'), ctrl.updateGrade);
router.put('/:id/submit', protect, authorize('teacher'), ctrl.submitGrade);
router.put('/:id/approve', protect, authorize('registrar','principal','super_admin'), ctrl.approveGrade);
router.put('/schedule/:scheduleId/release', protect, authorize('registrar','principal','super_admin'), ctrl.releaseGrade);

module.exports = router;
