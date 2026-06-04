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

  // Create Schools / Campuses
  let school = await School.findOne({ abbreviation: 'ISCP-MNL' });
  if (!school) {
    school = await School.create({
      name: 'International State Colleges of the Philippines - Manila',
      abbreviation: 'ISCP-MNL',
      tagline: 'Filipinos Sultus Es',
      address: { city: 'Manila', province: 'Metro Manila', country: 'Philippines' },
      contact: { email: 'manila@iscp.edu.ph', phone: '+63-2-8888-0001' },
      settings: { schoolLevel: 'both', academicYear: '2025-2026', currentSemester: '1st' },
    });

    await School.create({
      name: 'International State Colleges of the Philippines - Biringan',
      abbreviation: 'ISCP-BRN',
      tagline: 'Filipinos Sultus Es',
      address: { city: 'Biringan', province: 'Samar', country: 'Philippines' },
      contact: { email: 'biringan@iscp.edu.ph', phone: '+63-2-8888-0002' },
      settings: { schoolLevel: 'both', academicYear: '2025-2026', currentSemester: '1st' },
    });
    console.log('✅ Schools/Campuses created (Manila & Biringan)');
  }

  const defaultPass = process.env.SEED_DEFAULT_PASS;

  // Create Super Admin
  const superAdmin = await User.findOneAndUpdate({ email: 'superadmin@iscp.edu.ph' }, {
    firstName: 'Super', lastName: 'Admin', email: 'superadmin@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_ADMIN_PASS || defaultPass, 12), role: 'super_admin', isActive: true, isEmailVerified: true,
    schoolId: school._id,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Super Admin created: superadmin@iscp.edu.ph');

  // Create Principal
  await User.findOneAndUpdate({ email: 'principal@iscp.edu.ph' }, {
    firstName: 'Maria', middleName: 'Santos', lastName: 'Cruz', email: 'principal@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_PRINCIPAL_PASS || defaultPass, 12), role: 'principal', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Principal created: principal@iscp.edu.ph');

  // Create Registrar
  await User.findOneAndUpdate({ email: 'registrar@iscp.edu.ph' }, {
    firstName: 'Ana', lastName: 'Reyes', email: 'registrar@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_REGISTRAR_PASS || defaultPass, 12), role: 'registrar', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Registrar created: registrar@iscp.edu.ph');

  // Create Teacher
  const teacher = await User.findOneAndUpdate({ email: 'teacher@iscp.edu.ph' }, {
    firstName: 'Juan', middleName: 'dela', lastName: 'Cruz', email: 'teacher@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_TEACHER_PASS || defaultPass, 12), role: 'teacher', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Teacher created: teacher@iscp.edu.ph');

  // Create Student
  await User.findOneAndUpdate({ email: 'student@iscp.edu.ph' }, {
    firstName: 'Jose', lastName: 'Rizal', email: 'student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '26060401', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Student created: student@iscp.edu.ph');

  // Create Cashier
  await User.findOneAndUpdate({ email: 'cashier@iscp.edu.ph' }, {
    firstName: 'Rosa', lastName: 'Garcia', email: 'cashier@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_CASHIER_PASS || defaultPass, 12), role: 'cashier', schoolId: school._id, isActive: true, isEmailVerified: true,
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

  // 4. Create Curriculum for College (BSCS)
  const Curriculum = require('../models/Curriculum');
  await Curriculum.deleteMany({ schoolId: school._id });
  const bscsCurriculum = await Curriculum.create({
    schoolId: school._id,
    program: createdPrograms.BSCS,
    name: 'BSCS New Curriculum',
    code: 'BSCS-NEW',
    version: '1.0',
    effectiveYear: '2025',
    status: 'active',
    subjects: [
      { subject: createdSubjects['GE101'], yearLevel: 1, semester: '1st', isRequired: true, order: 1 },
      { subject: createdSubjects['MATH101'], yearLevel: 1, semester: '1st', isRequired: true, order: 2 },
      { subject: createdSubjects['CS101'], yearLevel: 1, semester: '1st', isRequired: true, order: 3 },
      { subject: createdSubjects['CS102'], yearLevel: 1, semester: '2nd', isRequired: true, order: 1 },
      { subject: createdSubjects['CS201'], yearLevel: 2, semester: '1st', isRequired: true, order: 1 },
    ],
    totalUnits: 15,
    createdBy: superAdmin._id
  });
  console.log('✅ Curriculums created (1)');

  // 5. Create Pre-enrolled Students
  const StudentProfile = require('../models/StudentProfile');
  const Enrollment = require('../models/Enrollment');
  const ClassSchedule = require('../models/ClassSchedule');

  await StudentProfile.deleteMany({ schoolId: school._id });
  await Enrollment.deleteMany({ schoolId: school._id });
  await ClassSchedule.deleteMany({ schoolId: school._id });

  // Create a class schedule for CS101
  const cs101Schedule = await ClassSchedule.create({
    schoolId: school._id,
    subject: createdSubjects['CS101'],
    teacher: teacher._id,
    section: 'CS1A',
    academicYear: '2025-2026',
    semester: '1st',
    schedule: [{ day: 'Mon', startTime: '09:00', endTime: '10:30' }, { day: 'Wed', startTime: '09:00', endTime: '10:30' }],
    maxStudents: 40,
    status: 'active'
  });

  // Create BSCS Student (College)
  const collegeStudent = await User.findOneAndUpdate({ email: 'college_student@iscp.edu.ph' }, {
    firstName: 'Juan', lastName: 'College', email: 'college_student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '26060405', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  await StudentProfile.create({
    userId: collegeStudent._id, schoolId: school._id, studentId: '26060405',
    program: createdPrograms.BSCS, yearLevel: 1, academicStatus: 'active', enrollmentStatus: 'enrolled',
    course: 'BSCS'
  });

  await Enrollment.create({
    schoolId: school._id, student: collegeStudent._id, academicYear: '2025-2026', semester: '1st',
    levelType: 'college', program: createdPrograms.BSCS, yearLevel: 1, type: 'new',
    status: 'enrolled',
    subjects: [{ subject: createdSubjects['CS101'], schedule: cs101Schedule._id, units: 3, status: 'enrolled' }],
    totalUnits: 3,
    steps: [
      { step: 'application', status: 'completed' }, { step: 'verification', status: 'completed' },
      { step: 'assessment', status: 'completed' }, { step: 'payment', status: 'completed' },
      { step: 'subject_assignment', status: 'completed' }, { step: 'confirmation', status: 'completed' }
    ]
  });

  // Create JHS Student (K-12)
  const jhsStudent = await User.findOneAndUpdate({ email: 'jhs_student@iscp.edu.ph' }, {
    firstName: 'Maria', lastName: 'Junior', email: 'jhs_student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '26060402', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  await StudentProfile.create({
    userId: jhsStudent._id, schoolId: school._id, studentId: '26060402',
    program: createdPrograms.JHS, gradeLevel: '7', academicStatus: 'active', enrollmentStatus: 'enrolled'
  });

  await Enrollment.create({
    schoolId: school._id, student: jhsStudent._id, academicYear: '2025-2026', semester: '1st',
    levelType: 'k12', program: createdPrograms.JHS, gradeLevel: '7', type: 'new',
    status: 'enrolled',
    subjects: [{ subject: createdSubjects['JHS-MATH7'], schedule: cs101Schedule._id, units: 3, status: 'enrolled' }],
    steps: [
      { step: 'application', status: 'completed' }, { step: 'verification', status: 'completed' },
      { step: 'assessment', status: 'completed' }, { step: 'payment', status: 'completed' },
      { step: 'subject_assignment', status: 'completed' }, { step: 'confirmation', status: 'completed' }
    ]
  });

  // Create Elem Student (K-12)
  const elemStudent = await User.findOneAndUpdate({ email: 'elem_student@iscp.edu.ph' }, {
    firstName: 'Pedro', lastName: 'Elementary', email: 'elem_student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '26060403', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  await StudentProfile.create({
    userId: elemStudent._id, schoolId: school._id, studentId: '26060403',
    program: createdPrograms.ELEM, gradeLevel: '1', academicStatus: 'active', enrollmentStatus: 'enrolled'
  });

  await Enrollment.create({
    schoolId: school._id, student: elemStudent._id, academicYear: '2025-2026', semester: '1st',
    levelType: 'k12', program: createdPrograms.ELEM, gradeLevel: '1', type: 'new',
    status: 'enrolled',
    subjects: [{ subject: createdSubjects['ELEM-MATH1'], schedule: cs101Schedule._id, units: 3, status: 'enrolled' }],
    steps: [
      { step: 'application', status: 'completed' }, { step: 'verification', status: 'completed' },
      { step: 'assessment', status: 'completed' }, { step: 'payment', status: 'completed' },
      { step: 'subject_assignment', status: 'completed' }, { step: 'confirmation', status: 'completed' }
    ]
  });

  // Create SHS Student (K-12)
  const shsStudent = await User.findOneAndUpdate({ email: 'shs_student@iscp.edu.ph' }, {
    firstName: 'Clara', lastName: 'Senior', email: 'shs_student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '26060404', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  await StudentProfile.create({
    userId: shsStudent._id, schoolId: school._id, studentId: '26060404',
    program: createdPrograms.STEM, gradeLevel: '11', academicStatus: 'active', enrollmentStatus: 'enrolled'
  });

  await Enrollment.create({
    schoolId: school._id, student: shsStudent._id, academicYear: '2025-2026', semester: '1st',
    levelType: 'k12', program: createdPrograms.STEM, gradeLevel: '11', type: 'new',
    status: 'enrolled',
    subjects: [{ subject: createdSubjects['SHS-STEM1'], schedule: cs101Schedule._id, units: 3, status: 'enrolled' }],
    steps: [
      { step: 'application', status: 'completed' }, { step: 'verification', status: 'completed' },
      { step: 'assessment', status: 'completed' }, { step: 'payment', status: 'completed' },
      { step: 'subject_assignment', status: 'completed' }, { step: 'confirmation', status: 'completed' }
    ]
  });
  console.log('✅ Pre-enrolled students created (College, JHS, Elem, SHS)');


  await mongoose.connection.close();
  console.log('\n🎉 Seeding complete!');
};

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
