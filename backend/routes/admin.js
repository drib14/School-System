const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

const adminRoles = ['super_admin','school_owner','principal','registrar','hr_staff'];

// Dashboard
router.get('/dashboard', protect, ctrl.getDashboardStats);
router.get('/dashboard/super', protect, authorize('super_admin'), ctrl.getSuperAdminStats);

// Schools (Tenant Management)
router.get('/schools', protect, authorize('super_admin'), ctrl.getSchools);
router.post('/schools', protect, authorize('super_admin'), ctrl.createSchool);

// Audit Logs
router.get('/audit-logs', protect, authorize('super_admin'), ctrl.getAuditLogs);

// Users
router.get('/users', protect, authorize(...adminRoles), ctrl.getUsers);
router.post('/users', protect, authorize(...adminRoles), ctrl.createUser);
router.get('/users/:id', protect, ctrl.getUser);
router.put('/users/:id', protect, authorize(...adminRoles), ctrl.updateUser);
router.put('/users/:id/toggle', protect, authorize(...adminRoles), ctrl.toggleUserStatus);
router.put('/users/:id/status', protect, authorize(...adminRoles), ctrl.toggleUserStatus);
router.delete('/users/:id', protect, authorize('super_admin','school_owner'), ctrl.deleteUser);

// Students
router.get('/students', protect, authorize(...adminRoles, 'teacher', 'librarian'), ctrl.getStudents);
router.post('/students', protect, authorize(...adminRoles), ctrl.createStudent);
router.get('/students/:id', protect, ctrl.getStudentById);
router.put('/students/:id', protect, authorize(...adminRoles), ctrl.updateStudent);
router.put('/students/:id/transfer', protect, authorize('registrar','principal','super_admin'), ctrl.transferStudent);
router.put('/students/:id/drop', protect, authorize('registrar','principal','super_admin'), ctrl.dropStudent);
router.put('/students/:id/graduate', protect, authorize('registrar','principal','super_admin'), ctrl.graduateStudent);

module.exports = router;
