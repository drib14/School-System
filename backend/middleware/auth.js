const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuditLog } = require('../models/Campus');

const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, schoolId: user.schoolId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) return res.status(401).json({ success: false, message: 'Not authorized. No token.' });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('-password -twoFactorSecret');
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    if (user.isLocked()) return res.status(403).json({ success: false, message: 'Account is temporarily locked.' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized for this action.` });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (_) {}
  next();
};

const auditLog = (action, module) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (data.success !== false) {
      try {
        await AuditLog.create({
          schoolId: req.user?.schoolId,
          user: req.user?._id,
          action,
          module,
          description: `${req.method} ${req.originalUrl}`,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          status: 'success',
        });
      } catch (_) {}
    }
    return originalJson(data);
  };
  next();
};

module.exports = { protect, authorize, optionalAuth, generateAccessToken, generateRefreshToken, auditLog };
