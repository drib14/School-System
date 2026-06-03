require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const School = require('../models/School');
const Subject = require('../models/Subject');
const Program = require('../models/Program');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Create School
  let school = await School.findOne({ abbreviation: 'ISCP' });
  if (!school) {
    school = await School.create({
      name: 'International State Colleges of the Philippines',
      abbreviation: 'ISCP',
      tagline: 'Filipinos Sultus Es',
      address: { city: 'Manila', province: 'Metro Manila', country: 'Philippines' },
      contact: { email: 'info@iscp.edu.ph', phone: '+63-2-8888-0000' },
      settings: { schoolLevel: 'both', academicYear: '2025-2026', currentSemester: '1st' },
    });
    console.log('✅ School created');
  }

  // Create Super Admin
  const superAdmin = await User.findOneAndUpdate({ email: 'superadmin@iscp.edu.ph' }, {
    firstName: 'Super', lastName: 'Admin', email: 'superadmin@iscp.edu.ph',
    password: 'Admin@12345', role: 'super_admin', isActive: true, isEmailVerified: true,
    schoolId: school._id,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Super Admin created: superadmin@iscp.edu.ph / Admin@12345');

  // Create Principal
  await User.findOneAndUpdate({ email: 'principal@iscp.edu.ph' }, {
    firstName: 'Maria', middleName: 'Santos', lastName: 'Cruz', email: 'principal@iscp.edu.ph',
    password: 'Principal@123', role: 'principal', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Principal created: principal@iscp.edu.ph / Principal@123');

  // Create Registrar
  await User.findOneAndUpdate({ email: 'registrar@iscp.edu.ph' }, {
    firstName: 'Ana', lastName: 'Reyes', email: 'registrar@iscp.edu.ph',
    password: 'Registrar@123', role: 'registrar', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Registrar created: registrar@iscp.edu.ph / Registrar@123');

  // Create Teacher
  const teacher = await User.findOneAndUpdate({ email: 'teacher@iscp.edu.ph' }, {
    firstName: 'Juan', middleName: 'dela', lastName: 'Cruz', email: 'teacher@iscp.edu.ph',
    password: 'Teacher@123', role: 'teacher', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Teacher created: teacher@iscp.edu.ph / Teacher@123');

  // Create Student
  await User.findOneAndUpdate({ email: 'student@iscp.edu.ph' }, {
    firstName: 'Jose', lastName: 'Rizal', email: 'student@iscp.edu.ph',
    password: 'Student@123', role: 'student', schoolId: school._id,
    studentId: '25-00001', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Student created: student@iscp.edu.ph / Student@123');

  // Create Cashier
  await User.findOneAndUpdate({ email: 'cashier@iscp.edu.ph' }, {
    firstName: 'Rosa', lastName: 'Garcia', email: 'cashier@iscp.edu.ph',
    password: 'Cashier@123', role: 'cashier', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  // Create sample programs
  const programs = [
    { code: 'BSCS', name: 'Bachelor of Science in Computer Science', type: 'college', level: 'bachelor', duration: 4 },
    { code: 'BSIT', name: 'Bachelor of Science in Information Technology', type: 'college', level: 'bachelor', duration: 4 },
    { code: 'BSBA', name: 'Bachelor of Science in Business Administration', type: 'college', level: 'bachelor', duration: 4 },
    { code: 'ABM', name: 'Accountancy, Business and Management', type: 'k12', level: 'senior_high', strand: 'ABM', track: 'Academic' },
    { code: 'STEM', name: 'Science, Technology, Engineering and Mathematics', type: 'k12', level: 'senior_high', strand: 'STEM', track: 'Academic' },
    { code: 'HUMSS', name: 'Humanities and Social Sciences', type: 'k12', level: 'senior_high', strand: 'HUMSS', track: 'Academic' },
  ];

  for (const p of programs) {
    await Program.findOneAndUpdate({ code: p.code, schoolId: school._id }, { ...p, schoolId: school._id, isActive: true }, { upsert: true, new: true });
  }
  console.log('✅ Programs created (6)');

  // Create sample subjects
  const subjects = [
    { code: 'CS101', name: 'Introduction to Computing', units: 3, category: 'core', department: 'CS' },
    { code: 'CS102', name: 'Programming Fundamentals', units: 3, category: 'core', department: 'CS' },
    { code: 'MATH101', name: 'College Mathematics', units: 3, category: 'core', department: 'Math' },
    { code: 'ENG101', name: 'English Communication 1', units: 3, category: 'core', department: 'English' },
    { code: 'FIL101', name: 'Filipino sa Piling Larangan', units: 3, category: 'core', department: 'Filipino' },
    { code: 'NSTP101', name: 'National Service Training Program 1', units: 3, category: 'nstp', department: 'NSTP' },
    { code: 'PE101', name: 'Physical Education 1', units: 2, category: 'pe', department: 'PE' },
    { code: 'SCI101', name: 'Natural Science 1', units: 3, category: 'core', department: 'Science' },
  ];

  for (const s of subjects) {
    await Subject.findOneAndUpdate({ code: s.code, schoolId: school._id }, { ...s, schoolId: school._id, isActive: true, level: 'college' }, { upsert: true, new: true });
  }
  console.log('✅ Subjects created (8)');

  await mongoose.connection.close();
  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Accounts:');
  console.log('  Super Admin: superadmin@iscp.edu.ph / Admin@12345');
  console.log('  Principal:   principal@iscp.edu.ph / Principal@123');
  console.log('  Registrar:   registrar@iscp.edu.ph / Registrar@123');
  console.log('  Teacher:     teacher@iscp.edu.ph / Teacher@123');
  console.log('  Student:     student@iscp.edu.ph / Student@123');
  console.log('  Cashier:     cashier@iscp.edu.ph / Cashier@123');
};

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
