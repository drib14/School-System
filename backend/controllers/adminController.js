const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { EmployeeProfile, AuditLog } = require('../models/Campus');
const School = require('../models/School');
const Enrollment = require('../models/Enrollment');
const Grade = require('../models/Grade');
const { Attendance } = require('../models/Attendance');
const { Fee, Assessment, Payment } = require('../models/Financial');

// ---- USERS ----
const getUsers = asyncHandler(async (req, res) => {
  const { role, schoolId, search, page = 1, limit = 20, isActive } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (schoolId) filter.schoolId = schoolId;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (req.user.role !== 'super_admin') filter.schoolId = req.user.schoolId;
  if (search) filter.$or = [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { studentId: { $regex: search, $options: 'i' } },
    { employeeId: { $regex: search, $options: 'i' } },
  ];

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password -refreshTokens -twoFactorSecret')
    .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), users });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshTokens -twoFactorSecret')
    .populate('schoolId', 'name abbreviation');
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, user });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await User.create({ ...req.body, createdBy: req.user._id, schoolId: req.body.schoolId || req.user.schoolId });
  res.status(201).json({ success: true, message: 'User created.', user });
});

const updateUser = asyncHandler(async (req, res) => {
  const forbidden = ['password', 'refreshTokens', 'twoFactorSecret'];
  forbidden.forEach(f => delete req.body[f]);
  const user = await User.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.user._id }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, user });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, [{ $set: { isActive: { $not: '$isActive' } } }], { new: true });
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted.' });
});

// ---- STUDENTS ----
const getStudents = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20, academicStatus, gradeLevel, program } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (academicStatus) filter.academicStatus = academicStatus;
  if (gradeLevel) filter.gradeLevel = gradeLevel;
  if (program) filter.program = program;
  if (search) {
    const users = await User.find({ role: 'student', $or: [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ]}).select('_id');
    filter.userId = { $in: users.map(u => u._id) };
  }

  const total = await StudentProfile.countDocuments(filter);
  const profiles = await StudentProfile.find(filter)
    .populate('userId', 'firstName middleName lastName email phone avatar studentId')
    .populate('program', 'name code')
    .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), students: profiles });
});

const getStudentById = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id)
    .populate('userId', '-password -refreshTokens')
    .populate('program', 'name code')
    .populate('scholarships');
  if (!profile) return res.status(404).json({ success: false, message: 'Student not found.' });
  res.json({ success: true, student: profile });
});

const createStudent = asyncHandler(async (req, res) => {
  const { firstName, middleName, lastName, email, password = 'iscp@1234', ...profileData } = req.body;

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const yearStr = now.getFullYear().toString().slice(-2);
  const count = await User.countDocuments({ role: 'student', schoolId: req.user.schoolId });
  const sequence = String(count + 1).padStart(3, '0');
  const studentId = `${month}${day}${yearStr}${sequence}`;

  const user = await User.create({
    firstName, middleName, lastName, email, password, role: 'student',
    schoolId: req.user.schoolId, studentId, createdBy: req.user._id,
  });

  const profile = await StudentProfile.create({
    userId: user._id, schoolId: req.user.schoolId, studentId, ...profileData, createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Student created.', student: profile, user });
});

const updateStudent = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findByIdAndUpdate(
    req.params.id, { ...req.body, updatedBy: req.user._id }, { new: true }
  ).populate('userId', '-password');
  if (!profile) return res.status(404).json({ success: false, message: 'Student not found.' });
  res.json({ success: true, student: profile });
});

const transferStudent = asyncHandler(async (req, res) => {
  const { newSchoolId, reason } = req.body;
  const profile = await StudentProfile.findByIdAndUpdate(
    req.params.id, { academicStatus: 'transferee', schoolId: newSchoolId, updatedBy: req.user._id }, { new: true }
  );
  res.json({ success: true, message: 'Student transferred.', student: profile });
});

const dropStudent = asyncHandler(async (req, res) => {
  await StudentProfile.findByIdAndUpdate(req.params.id, { academicStatus: 'dropped', updatedBy: req.user._id });
  res.json({ success: true, message: 'Student dropped.' });
});

const graduateStudent = asyncHandler(async (req, res) => {
  await StudentProfile.findByIdAndUpdate(req.params.id, { academicStatus: 'graduated', updatedBy: req.user._id });
  res.json({ success: true, message: 'Student graduated.' });
});

// ---- DASHBOARD ----
const getDashboardStats = asyncHandler(async (req, res) => {
  const schoolId = req.user.role === 'super_admin' ? req.query.schoolId : req.user.schoolId;
  const filter = schoolId ? { schoolId } : {};

  const [
    totalStudents, totalTeachers, totalStaff,
    enrolledThisSem, totalPayments, pendingEnrollments,
    recentEnrollments, recentPayments
  ] = await Promise.all([
    StudentProfile.countDocuments({ ...filter, academicStatus: 'active' }),
    User.countDocuments({ ...filter, role: 'teacher', isActive: true }),
    User.countDocuments({ ...filter, role: { $nin: ['student', 'teacher', 'parent'] }, isActive: true }),
    Enrollment.countDocuments({ ...filter, status: 'enrolled' }),
    Payment.aggregate([{ $match: { ...filter, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Enrollment.countDocuments({ ...filter, status: 'pending' }),
    Enrollment.find({ ...filter }).sort({ createdAt: -1 }).limit(5)
      .populate('student', 'firstName lastName').populate('program', 'name'),
    Payment.find({ ...filter, status: 'completed' }).sort({ createdAt: -1 }).limit(5)
      .populate('student', 'firstName lastName'),
  ]);

  res.json({
    success: true, stats: {
      totalStudents, totalTeachers, totalStaff, enrolledThisSem,
      totalRevenue: totalPayments[0]?.total || 0, pendingEnrollments,
    },
    recentEnrollments, recentPayments,
  });
});

const getSuperAdminStats = asyncHandler(async (req, res) => {
  const [totalSchools, totalUsers, totalStudents, totalRevenue] = await Promise.all([
    School.countDocuments(),
    User.countDocuments(),
    StudentProfile.countDocuments(),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);
  const schoolList = await School.find().select('name abbreviation subscription isActive createdAt').sort({ createdAt: -1 }).limit(10);
  
  res.json({ 
    success: true, 
    totalSchools,
    totalStudents,
    totalUsers, 
    monthlyRevenue: totalRevenue[0]?.total || 0,
    systemHealth: 99.9,
    activityByDay: Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i + 1}`,
      logins: Math.floor(Math.random() * 100) + 50,
      actions: Math.floor(Math.random() * 500) + 100,
    })),
    schoolList 
  });
});

const createSchool = asyncHandler(async (req, res) => {
  const { name, abbreviation, plan = 'starter', tagline, logo, address, contact, settings } = req.body;
  
  if (!name || !abbreviation) {
    return res.status(400).json({ success: false, message: 'Name and abbreviation are required.' });
  }

  const newSchool = await School.create({
    name, abbreviation, tagline, logo, address, contact, settings,
    plan, subscription: { status: 'active', plan }
  });

  res.status(201).json({ success: true, message: 'School created.', school: newSchool });
});

const getSchools = asyncHandler(async (req, res) => {
  const schools = await School.find().sort({ createdAt: -1 });
  const schoolsWithStats = await Promise.all(schools.map(async (s) => {
    const studentCount = await StudentProfile.countDocuments({ schoolId: s._id });
    return {
      ...s.toObject(),
      studentCount
    };
  }));
  res.json({ success: true, schools: schoolsWithStats });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const { limit = 20, page = 1 } = req.query;
  const filter = {};
  if (req.user.role !== 'super_admin') {
    filter.schoolId = req.user.schoolId;
  }
  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .populate('user', 'firstName lastName email')
    .populate('schoolId', 'name abbreviation')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, logs, page: Number(page), pages: Math.ceil(total / limit) });
});

const updateSchool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, abbreviation, plan, status, tagline, logo, address, contact, settings } = req.body;

  // Authorize: only super_admin or owner/principal of the specific school
  if (req.user.role !== 'super_admin' && req.user.schoolId.toString() !== id) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this school settings.' });
  }

  const school = await School.findById(id);
  if (!school) {
    return res.status(404).json({ success: false, message: 'School not found.' });
  }

  if (name) school.name = name;
  if (abbreviation) school.abbreviation = abbreviation;
  if (plan) {
    school.plan = plan;
    if (school.subscription) {
      school.subscription.plan = plan;
    } else {
      school.subscription = { plan, status: 'active' };
    }
  }
  if (status) {
    school.isActive = status === 'active';
    if (school.subscription) {
      school.subscription.status = status === 'active' ? 'active' : 'suspended';
    }
  }
  if (tagline !== undefined) school.tagline = tagline;
  if (logo !== undefined) school.logo = logo;
  
  if (address) {
    school.address = { ...school.address, ...address };
  }
  if (contact) {
    school.contact = { ...school.contact, ...contact };
  }
  if (settings) {
    school.settings = { ...school.settings, ...settings };
  }

  await school.save();
  res.json({ success: true, message: 'School settings updated successfully.', school });
});

const deleteSchool = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Only super_admin can delete schools
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete school campuses.' });
  }

  const school = await School.findById(id);
  if (!school) {
    return res.status(404).json({ success: false, message: 'School not found.' });
  }

  // Prevent deleting the main system school
  if (school.abbreviation === 'ISCP') {
    return res.status(400).json({ success: false, message: 'Cannot delete the primary system tenant.' });
  }

  await School.findByIdAndDelete(id);
  
  // Clean up users associated with this school, except super_admins
  await User.deleteMany({ schoolId: id, role: { $ne: 'super_admin' } });

  res.json({ success: true, message: 'School and associated accounts deleted successfully.' });
});

module.exports = { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  toggleUserStatus, 
  deleteUser, 
  getStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  transferStudent, 
  dropStudent, 
  graduateStudent, 
  getDashboardStats, 
  getSuperAdminStats, 
  createSchool, 
  getSchools, 
  getAuditLogs,
  updateSchool,
  deleteSchool
};

