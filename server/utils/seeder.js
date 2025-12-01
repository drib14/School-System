import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import Book from '../models/Book.js';
import Course from '../models/Course.js';
import Finance from '../models/Finance.js';
import Announcement from '../models/Announcement.js';
import Enrollment from '../models/Enrollment.js';

const seedData = async () => {
    try {
        // 1. Seed Admin
        const adminEmail = 'dribramirez@educore.edu';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            console.log('Seeding Admin User...');
            await User.create({
                name: 'Drib Ramirez',
                email: adminEmail,
                password: 'Jhondrib@1',
                role: 'Admin',
                isVerified: true
            });
        }

        // 2. Seed Mock Students if none
        let studentIds = [];
        const studentCount = await User.countDocuments({ role: 'Student' });
        if (studentCount < 5) {
            console.log('Seeding Mock Students...');
            const students = [
                { name: 'Alice Smith', email: 'alice@student.com', role: 'Student' },
                { name: 'Bob Jones', email: 'bob@student.com', role: 'Student' },
                { name: 'Charlie Day', email: 'charlie@student.com', role: 'Student' },
                { name: 'Diana Prince', email: 'diana@student.com', role: 'Student' },
                { name: 'Evan Peters', email: 'evan@student.com', role: 'Student' },
            ];
            for (const s of students) {
                 const newStudent = await User.create({ ...s, password: 'password123', isVerified: true });
                 studentIds.push(newStudent._id);
            }
        } else {
             const students = await User.find({ role: 'Student' });
             studentIds = students.map(s => s._id);
        }

        // 3. Seed Mock Teachers if none
        let teacherIds = [];
        const teacherCount = await User.countDocuments({ role: 'Teacher' });
        if (teacherCount < 2) {
             console.log('Seeding Mock Teachers...');
             const t1 = await User.create({ name: 'Mr. Anderson', email: 'anderson@teacher.com', password: 'password123', role: 'Teacher', isVerified: true });
             const t2 = await User.create({ name: 'Ms. Frizzle', email: 'frizzle@teacher.com', password: 'password123', role: 'Teacher', isVerified: true });
             teacherIds.push(t1._id, t2._id);
        } else {
            const teachers = await User.find({ role: 'Teacher' });
            teacherIds = teachers.map(t => t._id);
        }

        // 4. Seed Mock Parent
        const parentEmail = 'parent@educore.edu';
        const parentExists = await User.findOne({ email: parentEmail });
        if (!parentExists && studentIds.length > 0) {
            console.log('Seeding Mock Parent...');
            await User.create({
                name: 'John Smith',
                email: parentEmail,
                password: 'password123',
                role: 'Parent',
                isVerified: true,
                children: [studentIds[0]] // Link to first student (Alice)
            });
        }

        // 5. Seed Courses (Updated with Program/YearLevel/Section)
        // We delete existing to force update if schema changed
        await Course.deleteMany({});
        console.log('Seeding Courses...');
        if (teacherIds.length > 0) {
            const commonProps = { program: 'BS Computer Science', yearLevel: '1st Year', section: 'A' };

            await Course.create({
                code: 'CS101',
                name: 'Introduction to Computing',
                teacher: teacherIds[0],
                schedule: 'Mon/Wed 08:30 AM - 10:00 AM',
                room: 'Lab 1',
                ...commonProps
            });
            await Course.create({
                code: 'CS102',
                name: 'Computer Programming 1',
                teacher: teacherIds[0],
                schedule: 'Tue/Thu 10:30 AM - 12:00 PM',
                room: 'Lab 2',
                ...commonProps
            });
            await Course.create({
                code: 'MATH101',
                name: 'Mathematics in the Modern World',
                teacher: teacherIds[1],
                schedule: 'Fri 09:00 AM - 12:00 PM',
                room: 'Rm 305',
                ...commonProps
            });
            await Course.create({
                code: 'ENG101',
                name: 'Purposive Communication',
                teacher: teacherIds[1],
                schedule: 'Mon/Wed 01:00 PM - 02:30 PM',
                room: 'Rm 201',
                ...commonProps
            });
            await Course.create({
                code: 'PE101',
                name: 'Physical Education 1',
                teacher: teacherIds[1],
                schedule: 'Sat 08:00 AM - 10:00 AM',
                room: 'Gym',
                ...commonProps
            });
        }

        // 6. Seed Enrollments (CRITICAL: Link Students to Program/Section)
        await Enrollment.deleteMany({});
        console.log('Seeding Enrollments...');
        for (const sid of studentIds) {
            await Enrollment.create({
                student: sid,
                program: 'BS Computer Science',
                yearLevel: '1st Year',
                section: 'A',
                status: 'Active',
                paymentMethod: 'Full Payment'
            });
        }

        // 7. Seed Finance
        await Finance.deleteMany({}); // Reset to avoid duplicates on re-seed
        console.log('Seeding Finance...');
        for (const sid of studentIds) {
            await Finance.create({ student: sid, title: 'Tuition Fee - Sem 1', amount: 25000, type: 'Income', status: 'Pending', dueDate: new Date() });
            await Finance.create({ student: sid, title: 'Misc Fee', amount: 5000, type: 'Income', status: 'Paid', dueDate: new Date() });
        }

        // 8. Seed Announcements
        const announcementCount = await Announcement.countDocuments();
        if (announcementCount === 0) {
            console.log('Seeding Announcements...');
            await Announcement.create({ title: 'Welcome to EduCore!', content: 'We are excited to have you on board.', priority: 'High' });
            await Announcement.create({ title: 'System Maintenance', content: 'Scheduled maintenance on Sunday 2am.', priority: 'Normal' });
            await Announcement.create({ title: 'Exam Schedule', content: 'Midterm exams start next week.', priority: 'High' });
        }

        console.log('Seeding Complete.');

    } catch (error) {
        console.error('Seeding Error:', error);
    }
};

export default seedData;
