const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');
const School = require('../models/School');
const { sendMail, emailTemplates } = require('../config/mailer');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// @desc    Register user
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { firstName, middleName, lastName, email, password, role, schoolId, phone, gender, birthDate } = req.body;

  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered.' });

  // Validate role permissions — only super_admin can create super_admin
  const restrictedRoles = ['super_admin', 'school_owner', 'principal'];
  if (restrictedRoles.includes(role) && (!req.user || req.user.role !== 'super_admin')) {
    return res.status(403).json({ success: false, message: 'Not authorized to create this role.' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    firstName, middleName, lastName, email, password, role,
    schoolId: schoolId || null,
    phone, gender, birthDate,
    emailVerificationToken: verificationToken,
    createdBy: req.user?._id,
  });

  // Send welcome email
  try {
    await sendMail({
      to: email,
      subject: 'Welcome to ISCP School System',
      html: emailTemplates.welcome(user.firstName),
    });
  } catch (_) {}

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens.push({ token: refreshToken, device: req.headers['user-agent'] || 'Unknown' });
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    accessToken,
    user: {
      id: user._id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, role: user.role, avatar: user.avatar, schoolId: user.schoolId,
    },
  });
});

// @desc    Login
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password, twoFactorCode } = req.body;

  if (!email || !password) return res.status(400).json({ success: false, message: 'Email/ID and password required.' });

  const user = await User.findOne({
    $or: [{ email }, { studentId: email }, { employeeId: email }, { systemId: email }]
  }).select('+password +twoFactorSecret +refreshTokens +loginAttempts +lockUntil');
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated.' });
  if (user.isLocked()) return res.status(403).json({ success: false, message: 'Account temporarily locked. Try again later.' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      user.loginAttempts = 0;
    }
    await user.save();
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  // 2FA check
  if (user.twoFactorEnabled) {
    if (!twoFactorCode) {
      return res.status(200).json({ success: true, requiresTwoFactor: true, message: 'Please enter your 2FA code.' });
    }
    // TOTP verify
    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: twoFactorCode, window: 2 });
    // Email OTP verify
    const emailValid = user.twoFactorEmailCode === twoFactorCode && user.twoFactorEmailExpires > Date.now();
    if (!verified && !emailValid) {
      return res.status(401).json({ success: false, message: 'Invalid 2FA code.' });
    }
    user.twoFactorEmailCode = undefined;
    user.twoFactorEmailExpires = undefined;
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Keep max 5 devices
  if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
  user.refreshTokens.push({ token: refreshToken, device: req.headers['user-agent'] || 'Unknown' });
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const school = user.schoolId ? await School.findById(user.schoolId).select('name abbreviation logo settings') : null;

  res.json({
    success: true, message: 'Login successful.',
    accessToken,
    user: {
      id: user._id, firstName: user.firstName, lastName: user.lastName, fullName: user.fullName,
      email: user.email, role: user.role, avatar: user.avatar,
      schoolId: user.schoolId, twoFactorEnabled: user.twoFactorEnabled,
    },
    school,
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token.' });

  const jwt = require('jsonwebtoken');
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) return res.status(401).json({ success: false, message: 'User not found.' });

  const tokenExists = user.refreshTokens.some(t => t.token === token);
  if (!tokenExists) return res.status(401).json({ success: false, message: 'Refresh token revoked.' });

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshTokens = user.refreshTokens.filter(t => t.token !== token);
  user.refreshTokens.push({ token: newRefreshToken, device: req.headers['user-agent'] || 'Unknown' });
  await user.save();

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, accessToken });
});

// @desc    Logout
// @route   POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (token && req.user) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: { token } } });
  }
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendMail({ to: email, subject: 'ISCP - Password Reset Request', html: emailTemplates.passwordReset(resetUrl) });

  res.json({ success: true, message: 'Password reset email sent.' });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  res.json({ success: true, message: 'Password reset successfully. Please login.' });
});

// @desc    Setup 2FA (TOTP)
// @route   POST /api/auth/2fa/setup
const setup2FA = asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `ISCP (${req.user.email})`, length: 20 });
  await User.findByIdAndUpdate(req.user._id, { twoFactorTempSecret: secret.base32 });
  const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
  res.json({ success: true, secret: secret.base32, qrCode: qrDataUrl });
});

// @desc    Verify and enable 2FA
// @route   POST /api/auth/2fa/verify
const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id).select('+twoFactorTempSecret');
  const verified = speakeasy.totp.verify({ secret: user.twoFactorTempSecret, encoding: 'base32', token, window: 2 });
  if (!verified) return res.status(400).json({ success: false, message: 'Invalid verification code.' });

  await User.findByIdAndUpdate(req.user._id, {
    twoFactorSecret: user.twoFactorTempSecret, twoFactorTempSecret: undefined, twoFactorEnabled: true,
  });
  res.json({ success: true, message: '2FA enabled successfully.' });
});

// @desc    Disable 2FA
// @route   DELETE /api/auth/2fa
const disable2FA = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    twoFactorEnabled: false, twoFactorSecret: undefined, twoFactorTempSecret: undefined,
  });
  res.json({ success: true, message: '2FA disabled.' });
});

// @desc    Send email OTP for 2FA
// @route   POST /api/auth/2fa/email-otp
const sendEmailOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: true });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.twoFactorEmailCode = otp;
  user.twoFactorEmailExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendMail({ to: email, subject: 'ISCP - Your Login OTP', html: emailTemplates.twoFactor(otp) });
  res.json({ success: true, message: 'OTP sent to your email.' });
});

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('schoolId', 'name abbreviation logo settings').lean();
  if (user && user.role === 'student') {
    const StudentProfile = require('../models/StudentProfile');
    const profile = await StudentProfile.findOne({ userId: user._id }).populate('program', 'name code type level').lean();
    user.profile = profile;
  }
  res.json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/auth/me
const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['firstName', 'middleName', 'lastName', 'phone', 'address', 'gender', 'birthDate', 'notificationPrefs'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }
  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();
  res.json({ success: true, message: 'Password changed. Please login again.' });
});

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword, setup2FA, verify2FA, disable2FA, sendEmailOTP, getMe, updateMe, changePassword };
