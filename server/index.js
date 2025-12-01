import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import attendanceRoutes from './routes/attendance.js';
import gradeRoutes from './routes/grades.js';
import libraryRoutes from './routes/library.js';
import dashboardRoutes from './routes/dashboard.js';
import courseRoutes from './routes/courses.js';
import financeRoutes from './routes/finance.js';
import enrollmentRoutes from './routes/enrollments.js';
import announcementRoutes from './routes/announcements.js';
import lmsRoutes from './routes/lms.js';
import examRoutes from './routes/exams.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import seedData from './utils/seeder.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        seedData();
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/exams', examRoutes);

app.get('/', (req, res) => {
    res.send('EduCore API is running...');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
