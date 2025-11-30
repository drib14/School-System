import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import Book from '../models/Book.js';

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
             const students = await User.find({ role: 'Student' }).limit(1);
             if (students.length > 0) studentIds.push(students[0]._id);
        }

        // 3. Seed Mock Teachers if none
        const teacherCount = await User.countDocuments({ role: 'Teacher' });
        if (teacherCount < 2) {
             console.log('Seeding Mock Teachers...');
             await User.create({ name: 'Mr. Anderson', email: 'anderson@teacher.com', password: 'password123', role: 'Teacher', isVerified: true });
             await User.create({ name: 'Ms. Frizzle', email: 'frizzle@teacher.com', password: 'password123', role: 'Teacher', isVerified: true });
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

        console.log('Seeding Complete (or Skipped if exists).');

    } catch (error) {
        console.error('Seeding Error:', error);
    }
};

export default seedData;
