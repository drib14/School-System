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
    password: await bcrypt.hash(process.env.SEED_ADMIN_PASS || 'Admin@12345', 12), role: 'super_admin', isActive: true, isEmailVerified: true,
    schoolId: school._id,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Super Admin created: superadmin@iscp.edu.ph');

  // Create Principal
  await User.findOneAndUpdate({ email: 'principal@iscp.edu.ph' }, {
    firstName: 'Maria', middleName: 'Santos', lastName: 'Cruz', email: 'principal@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_PRINCIPAL_PASS || 'Principal@123', 12), role: 'principal', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Principal created: principal@iscp.edu.ph');

  // Create Registrar
  await User.findOneAndUpdate({ email: 'registrar@iscp.edu.ph' }, {
    firstName: 'Ana', lastName: 'Reyes', email: 'registrar@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_REGISTRAR_PASS || 'Registrar@123', 12), role: 'registrar', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Registrar created: registrar@iscp.edu.ph');

  // Create Teacher
  const teacher = await User.findOneAndUpdate({ email: 'teacher@iscp.edu.ph' }, {
    firstName: 'Juan', middleName: 'dela', lastName: 'Cruz', email: 'teacher@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_TEACHER_PASS || 'Teacher@123', 12), role: 'teacher', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Teacher created: teacher@iscp.edu.ph');

  // Create Student
  await User.findOneAndUpdate({ email: 'student@iscp.edu.ph' }, {
    firstName: 'Jose', lastName: 'Rizal', email: 'student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || 'Student@123', 12), role: 'student', schoolId: school._id,
    studentId: '25-00001', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Student created: student@iscp.edu.ph');

  // Create Cashier
  await User.findOneAndUpdate({ email: 'cashier@iscp.edu.ph' }, {
    firstName: 'Rosa', lastName: 'Garcia', email: 'cashier@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_CASHIER_PASS || 'Cashier@123', 12), role: 'cashier', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  // Comprehensive Academic Structure Seeding
  await Program.deleteMany({ schoolId: school._id });
  await Subject.deleteMany({ schoolId: school._id });

  // 1. Programs
  const programsData = [
    { code: 'ELEM', name: 'Elementary Education', type: 'k12', level: 'elementary', duration: 6 },
    { code: 'JHS', name: 'Junior High School', type: 'k12', level: 'junior_high', duration: 4 },
    { code: 'STEM', name: 'Science, Technology, Engineering, and Mathematics', type: 'k12', level: 'senior_high', duration: 2, strand: 'STEM', track: 'Academic' },
    { code: 'ABM', name: 'Accountancy, Business and Management', type: 'k12', level: 'senior_high', duration: 2, strand: 'ABM', track: 'Academic' },
    { code: 'HUMSS', name: 'Humanities and Social Sciences', type: 'k12', level: 'senior_high', duration: 2, strand: 'HUMSS', track: 'Academic' },
    { code: 'BSCS', name: 'Bachelor of Science in Computer Science', type: 'college', level: 'bachelor', duration: 4 },
    { code: 'BSIT', name: 'Bachelor of Science in Information Technology', type: 'college', level: 'bachelor', duration: 4 },
    { code: 'BSED', name: 'Bachelor of Secondary Education', type: 'college', level: 'bachelor', duration: 4 },
  ];

  const createdPrograms = {};
  for (const p of programsData) {
    const prog = await Program.create({ ...p, schoolId: school._id, createdBy: superAdmin._id });
    createdPrograms[p.code] = prog._id;
  }
  console.log(`✅ Programs created (${programsData.length})`);

  // 2. Subjects
  // Elementary
  const elemSubjects = [
    { code: 'ELEM-MATH1', name: 'Mathematics 1', units: 3, level: 'k12', gradeLevel: ['1'], program: [createdPrograms.ELEM] },
    { code: 'ELEM-ENG1', name: 'English 1', units: 3, level: 'k12', gradeLevel: ['1'], program: [createdPrograms.ELEM] },
    { code: 'ELEM-SCI3', name: 'Science 3', units: 3, level: 'k12', gradeLevel: ['3'], program: [createdPrograms.ELEM] },
  ];

  // JHS
  const jhsSubjects = [
    { code: 'JHS-MATH7', name: 'Mathematics 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
    { code: 'JHS-ENG7', name: 'English 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
    { code: 'JHS-SCI7', name: 'Science 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
  ];

  // SHS (Strand specific)
  const shsSubjects = [
    // Core
    { code: 'SHS-CORE1', name: 'Oral Communication in Context', units: 3, level: 'k12', gradeLevel: ['11','12'], program: [createdPrograms.STEM, createdPrograms.ABM, createdPrograms.HUMSS] },
    // STEM
    { code: 'SHS-STEM1', name: 'Pre-Calculus', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.STEM] },
    { code: 'SHS-STEM2', name: 'Basic Calculus', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.STEM] }, // prerequisite: Pre-Calculus (linked later)
    // ABM
    { code: 'SHS-ABM1', name: 'Fundamentals of ABM 1', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.ABM] },
  ];

  // College
  const collegeSubjects = [
    // Gen Ed
    { code: 'GE101', name: 'Understanding the Self', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS, createdPrograms.BSIT, createdPrograms.BSED] },
    { code: 'MATH101', name: 'College Algebra', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS, createdPrograms.BSIT] },

    // BSCS
    { code: 'CS101', name: 'Introduction to Computing', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS, createdPrograms.BSIT] },
    { code: 'CS102', name: 'Programming Fundamentals', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] }, // prereq: CS101
    { code: 'CS201', name: 'Data Structures and Algorithms', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] }, // prereq: CS102
  ];

  const allSubjects = [...elemSubjects, ...jhsSubjects, ...shsSubjects, ...collegeSubjects];
  const createdSubjects = {};

  for (const s of allSubjects) {
    const subj = await Subject.create({ ...s, schoolId: school._id, createdBy: superAdmin._id });
    createdSubjects[s.code] = subj._id;
  }

  // 3. Link Prerequisites
  await Subject.findByIdAndUpdate(createdSubjects['SHS-STEM2'], { prerequisites: [createdSubjects['SHS-STEM1']] });
  await Subject.findByIdAndUpdate(createdSubjects['CS102'], { prerequisites: [createdSubjects['CS101']] });
  await Subject.findByIdAndUpdate(createdSubjects['CS201'], { prerequisites: [createdSubjects['CS102']] });

  console.log(`✅ Subjects created and prerequisites linked (${allSubjects.length})`);

  await mongoose.connection.close();
  console.log('\n🎉 Seeding complete!');
};

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
