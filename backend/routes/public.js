const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Program = require('../models/Program');
const { CampusLocation } = require('../models/Campus');
const { Visitor } = require('../models/Services');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

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

// @route   POST /api/public/visitors/register
// @desc    Register a new visitor publicly and generate a gate pass
// @access  Public
router.post('/visitors/register', async (req, res) => {
  try {
    const { campusId, firstName, lastName, phone, email, purpose, personToVisit, department, idType, idNumber, vehiclePlate } = req.body;
    
    if (!campusId || !firstName || !lastName || !purpose || !personToVisit) {
      return res.status(400).json({ success: false, message: 'Campus, Name, Purpose, and Person to Visit are required.' });
    }

    // Find the campus to get schoolId
    const campus = await CampusLocation.findById(campusId);
    if (!campus) {
      return res.status(404).json({ success: false, message: 'Selected campus not found.' });
    }

    const passCode = uuidv4().slice(0, 8).toUpperCase();
    const qrData = JSON.stringify({ type: 'visitor', code: passCode, name: `${firstName} ${lastName}` });
    const qrCodeImage = await qrcode.toDataURL(qrData);

    const visitor = await Visitor.create({
      schoolId: campus.schoolId,
      firstName,
      lastName,
      phone,
      email,
      purpose,
      personToVisit,
      department,
      idType,
      idNumber,
      vehiclePlate,
      qrCode: qrCodeImage,
      status: 'checked_in',
      remarks: 'Self-registered via Public Gate Pass Portal'
    });

    res.status(201).json({ success: true, message: 'Visitor registration successful.', visitor });
  } catch (err) {
    console.error('Visitor registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during visitor registration.' });
  }
});

module.exports = router;
