const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Program = require('../models/Program');
const { CampusLocation } = require('../models/Campus');

// @route   GET /api/public/stats
// @desc    Get high-level public stats for the landing page
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalStaff = await User.countDocuments({
      role: { $in: ['teacher', 'principal', 'school_owner', 'super_admin', 'registrar', 'cashier', 'accountant', 'librarian', 'hr_staff'] },
      isActive: true
    });
    const totalPrograms = await Program.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        students: totalStudents,
        staff: totalStaff,
        programs: totalPrograms,
        employmentRate: '95%'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/public/campuses
// @desc    Get all public campuses
// @access  Public
router.get('/campuses', async (req, res) => {
  try {
    const campuses = await CampusLocation.find({ isActive: true }).select('name code address imageUrl contact');
    res.json({ success: true, campuses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
