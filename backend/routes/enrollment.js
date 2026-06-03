const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/enrollmentController');

router.get('/', protect, ctrl.getEnrollments);
router.post('/', protect, authorize('registrar','principal','super_admin','school_owner'), ctrl.createEnrollment);
router.get('/me', protect, authorize('student'), ctrl.getMyEnrollment);
router.get('/:id', protect, ctrl.getEnrollment);
router.put('/:id/status', protect, authorize('registrar','principal','super_admin','cashier'), ctrl.updateEnrollmentStatus);
router.put('/:id/subjects', protect, authorize('registrar','principal','super_admin'), ctrl.assignSubjects);

module.exports = router;
