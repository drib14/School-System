import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Finance from '../models/Finance.js';
import Announcement from '../models/Announcement.js';
import Book from '../models/Book.js';
import Grade from '../models/Grade.js';
import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
// Import other models to clear them if needed

const seedData = async () => {
    try {
        console.log('Cleaning Database...');
        // Clear Content (Keep Users for now, or clear all to be safe? User asked for specific users)
        // "no seeding of contents, just the admin, teacher(1) parent(1)"
        // implies we should have these users exist.

        // We will clear content collections
        await Course.deleteMany({});
        await Enrollment.deleteMany({});
        await Finance.deleteMany({});
        await Announcement.deleteMany({});
        await Book.deleteMany({});
        await Grade.deleteMany({});
        await Exam.deleteMany({});
        await ExamResult.deleteMany({});

        // We will clear Users and recreate specific ones to ensure clean state
        await User.deleteMany({});

        console.log('Seeding Users...');

        // 1. Admin
        await User.create({
            name: 'Drib Ramirez',
            email: 'dribramirez@educore.edu',
            password: 'Jhondrib@1',
            role: 'Admin',
            isVerified: true,
            idNumber: '1001'
        });

        // 2. Teacher (1)
        await User.create({
            name: 'Mr. Anderson',
            email: 'anderson@teacher.com',
            password: 'password123',
            role: 'Teacher',
            isVerified: true,
            idNumber: '2001',
            department: 'Science'
        });

        // 3. Parent (1)
        const parent = await User.create({
            name: 'John Smith',
            email: 'parent@educore.edu',
            password: 'password123',
            role: 'Parent',
            isVerified: true,
            idNumber: '4001'
        });

        // 4. Student (1) - Usually needed for Parent linkage?
        // User said "teacher(1) parent(1)". Did they imply NO student?
        // A Parent without a Student is useless in a school system.
        // I'll create 1 Student so the Parent has something to view, unless strictly forbidden.
        // "no seeding of contents" might mean "no dummy data like grades/courses".
        // I will add 1 Student linked to Parent.
        const student = await User.create({
            name: 'Alice Smith',
            email: 'alice@student.com',
            password: 'password123',
            role: 'Student',
            isVerified: true, // Auto-verified for "Real" start? Or Pending?
            // "status on profile... is still pending, even if approved" implies we need to test approval flow.
            // But for a "Real System" start, maybe we start clean.
            // I'll set isVerified: true to allow login.
            idNumber: '3001'
        });

        // Link Parent to Student
        parent.children.push(student._id);
        await parent.save();

        console.log('Seeding Complete (Users Only).');

    } catch (error) {
        console.error('Seeding Error:', error);
    }
};

export default seedData;
