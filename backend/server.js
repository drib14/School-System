require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const enrollmentRoutes = require('./routes/enrollment');
const gradeRoutes = require('./routes/grades');
const attendanceRoutes = require('./routes/attendance');
const academicRoutes = require('./routes/academics');
const financialRoutes = require('./routes/financial');
const communicationRoutes = require('./routes/communication');
// New routes
const hrRoutes = require('./routes/hr');
const lmsRoutes = require('./routes/lms');
const securityRoutes = require('./routes/security');
const clinicRoutes = require('./routes/clinic');
const guidanceRoutes = require('./routes/guidance');
const parentRoutes = require('./routes/parent');
const analyticsRoutes = require('./routes/analytics');
const campusRoutes = require('./routes/campus');
const servicesRoutes = require('./routes/services');
const admissionRoutes = require('./routes/admission');


const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
});

app.set('io', io);
global.io = io;


// Connect DB
connectDB();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many requests. Please try again later.' } });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/communication', communicationRoutes);
// New route registrations
app.use('/api/hr', hrRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/guidance', guidanceRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/admission', admissionRoutes);
const publicRoutes = require('./routes/public');
app.use('/api/public', publicRoutes);


// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV }));

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on('join-school', (schoolId) => {
    socket.join(`school-${schoolId}`);
  });

  socket.on('typing', ({ conversationId, userId, isTyping }) => {
    socket.to(conversationId).emit('user-typing', { userId, isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 ISCP School System API running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
