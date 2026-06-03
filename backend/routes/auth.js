const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  register, login, refreshToken, logout, forgotPassword, resetPassword,
  setup2FA, verify2FA, disable2FA, sendEmailOTP, getMe, updateMe, changePassword,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/2fa/email-otp', sendEmailOTP);
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verify2FA);
router.delete('/2fa', protect, disable2FA);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
