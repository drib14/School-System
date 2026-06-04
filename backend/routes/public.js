const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Program = require('../models/Program');

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

    // Since this is a sample/seeded DB and might not have 10k yet, 
    // we can either return true counts or bumped up counts if the user wants realistic landing page numbers.
    // Given the prompt "fetch those credentials from db", we'll return actual DB counts.

    res.json({
      success: true,
      data: {
        students: totalStudents,
        staff: totalStaff,
        programs: totalPrograms,
        employmentRate: '95%' // Hardcoded or mock metric
      }
    });
  } catch (err) {
    console.error('Error fetching public stats:', err);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
});

// @route   GET /api/public/schools
// @desc    Get active schools/campuses
// @access  Public
router.get('/schools', async (req, res) => {
  try {
    const School = require('../models/School');
    const schools = await School.find({ isActive: true }).select('name abbreviation logo address tagline settings');
    res.json({ success: true, schools });
  } catch (err) {
    console.error('Error fetching schools:', err);
    res.status(500).json({ success: false, message: 'Server error fetching schools' });
  }
});

module.exports = router;
