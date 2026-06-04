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
  const mainStudent = await User.findOneAndUpdate({ email: 'student@iscp.edu.ph' }, {
    firstName: 'Jose', lastName: 'Rizal', email: 'student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '26060401', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Student created: student@iscp.edu.ph');

  const specialStudent = await User.findOneAndUpdate({ email: 'special@iscp.edu.ph' }, {
    firstName: 'Andres', lastName: 'Bonifacio', email: 'special@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '26060405', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Special Student created: special@iscp.edu.ph');

  // Create Cashier
  await User.findOneAndUpdate({ email: 'cashier@iscp.edu.ph' }, {
    firstName: 'Rosa', lastName: 'Garcia', email: 'cashier@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_CASHIER_PASS || defaultPass, 12), role: 'cashier', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  // Create Librarian
  await User.findOneAndUpdate({ email: 'librarian@iscp.edu.ph' }, {
    firstName: 'Leonor', lastName: 'Orosa', email: 'librarian@iscp.edu.ph',
    password: await bcrypt.hash(defaultPass, 12), role: 'librarian', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  // Create Nurse
  await User.findOneAndUpdate({ email: 'nurse@iscp.edu.ph' }, {
    firstName: 'Clara', lastName: 'Barton', email: 'nurse@iscp.edu.ph',
    password: await bcrypt.hash(defaultPass, 12), role: 'nurse', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  // Create HR
  await User.findOneAndUpdate({ email: 'hr@iscp.edu.ph' }, {
    firstName: 'Michael', lastName: 'Scott', email: 'hr@iscp.edu.ph',
    password: await bcrypt.hash(defaultPass, 12), role: 'hr_staff', schoolId: school._id, isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('✅ Other Staff created (Cashier, Librarian, Nurse, HR)');

  // Comprehensive Academic Structure Seeding
  // Removed deleteMany to preserve existing data

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
    { code: 'BSN', name: 'Bachelor of Science in Nursing', type: 'college', level: 'bachelor', duration: 4 },
    { code: 'BSCE', name: 'Bachelor of Science in Civil Engineering', type: 'college', level: 'bachelor', duration: 4 },
    { code: 'BSARCH', name: 'Bachelor of Science in Architecture', type: 'college', level: 'bachelor', duration: 5 },
    { code: 'BSBA', name: 'Bachelor of Science in Business Administration', type: 'college', level: 'bachelor', duration: 4 },
    { code: 'BSPSYCH', name: 'Bachelor of Science in Psychology', type: 'college', level: 'bachelor', duration: 4 },
    { code: 'ALS', name: 'Alternative Learning System (ALS)', type: 'special', level: 'special', duration: 1 },
    { code: 'SPED', name: 'Special Education (SPED)', type: 'special', level: 'special', duration: 1 },
  ];

  const createdPrograms = {};
  for (const p of programsData) {
    const prog = await Program.findOneAndUpdate(
      { code: p.code, schoolId: school._id },
      { ...p, createdBy: superAdmin._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdPrograms[p.code] = prog._id;
  }
  console.log(`✅ Programs created/updated (${programsData.length})`);

  // 2. Subjects
  // Elementary
  const elemSubjects = [
    { code: 'ELEM-MATH1', name: 'Mathematics 1', units: 3, level: 'k12', gradeLevel: ['1'], program: [createdPrograms.ELEM] },
    { code: 'ELEM-ENG1', name: 'English 1', units: 3, level: 'k12', gradeLevel: ['1'], program: [createdPrograms.ELEM] },
    { code: 'ELEM-SCI3', name: 'Science 3', units: 3, level: 'k12', gradeLevel: ['3'], program: [createdPrograms.ELEM] },
    { code: 'ELEM-FIL1', name: 'Filipino 1', units: 3, level: 'k12', gradeLevel: ['1'], program: [createdPrograms.ELEM] },
    { code: 'ELEM-AP1', name: 'Araling Panlipunan 1', units: 3, level: 'k12', gradeLevel: ['1'], program: [createdPrograms.ELEM] },
    { code: 'ELEM-MAPEH1', name: 'MAPEH 1', units: 3, level: 'k12', gradeLevel: ['1'], program: [createdPrograms.ELEM] },
    { code: 'ELEM-ESP1', name: 'Edukasyon sa Pagpapakatao 1', units: 3, level: 'k12', gradeLevel: ['1'], program: [createdPrograms.ELEM] },
    { code: 'ELEM-TLE4', name: 'EPP 4', units: 3, level: 'k12', gradeLevel: ['4'], program: [createdPrograms.ELEM] },
  ];

  // JHS
  const jhsSubjects = [
    { code: 'JHS-MATH7', name: 'Mathematics 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
    { code: 'JHS-ENG7', name: 'English 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
    { code: 'JHS-SCI7', name: 'Science 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
    { code: 'JHS-FIL7', name: 'Filipino 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
    { code: 'JHS-AP7', name: 'Araling Panlipunan 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
    { code: 'JHS-MAPEH7', name: 'MAPEH 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
    { code: 'JHS-ESP7', name: 'Edukasyon sa Pagpapakatao 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
    { code: 'JHS-TLE7', name: 'TLE 7', units: 3, level: 'k12', gradeLevel: ['7'], program: [createdPrograms.JHS] },
  ];

  // SHS (Strand specific)
  const shsSubjects = [
    // Core (Shared)
    { code: 'SHS-CORE1', name: 'Oral Communication in Context', units: 3, level: 'k12', gradeLevel: ['11','12'], program: [createdPrograms.STEM, createdPrograms.ABM, createdPrograms.HUMSS] },
    { code: 'SHS-CORE2', name: 'Reading and Writing Skills', units: 3, level: 'k12', gradeLevel: ['11','12'], program: [createdPrograms.STEM, createdPrograms.ABM, createdPrograms.HUMSS] },
    { code: 'SHS-CORE3', name: 'Komunikasyon at Pananaliksik', units: 3, level: 'k12', gradeLevel: ['11','12'], program: [createdPrograms.STEM, createdPrograms.ABM, createdPrograms.HUMSS] },
    
    // STEM
    { code: 'SHS-STEM1', name: 'Pre-Calculus', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.STEM] },
    { code: 'SHS-STEM2', name: 'Basic Calculus', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.STEM] },
    { code: 'SHS-STEM3', name: 'General Physics 1', units: 3, level: 'k12', gradeLevel: ['12'], program: [createdPrograms.STEM] },
    { code: 'SHS-STEM4', name: 'General Physics 2', units: 3, level: 'k12', gradeLevel: ['12'], program: [createdPrograms.STEM] },
    { code: 'SHS-STEM5', name: 'General Chemistry 1', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.STEM] },
    { code: 'SHS-STEM6', name: 'General Chemistry 2', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.STEM] },
    { code: 'SHS-STEM7', name: 'General Biology 1', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.STEM] },
    { code: 'SHS-STEM8', name: 'General Biology 2', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.STEM] },
    
    // ABM
    { code: 'SHS-ABM1', name: 'Fundamentals of ABM 1', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.ABM] },
    { code: 'SHS-ABM2', name: 'Fundamentals of ABM 2', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.ABM] },
    { code: 'SHS-ABM3', name: 'Business Math', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.ABM] },
    { code: 'SHS-ABM4', name: 'Business Finance', units: 3, level: 'k12', gradeLevel: ['12'], program: [createdPrograms.ABM] },
    { code: 'SHS-ABM5', name: 'Organization and Management', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.ABM] },
    { code: 'SHS-ABM6', name: 'Principles of Marketing', units: 3, level: 'k12', gradeLevel: ['12'], program: [createdPrograms.ABM] },
    { code: 'SHS-ABM7', name: 'Business Ethics and Social Responsibility', units: 3, level: 'k12', gradeLevel: ['12'], program: [createdPrograms.ABM] },
    { code: 'SHS-ABM8', name: 'Applied Economics', units: 3, level: 'k12', gradeLevel: ['12'], program: [createdPrograms.ABM] },

    // HUMSS
    { code: 'SHS-HUMSS1', name: 'Creative Writing', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.HUMSS] },
    { code: 'SHS-HUMSS2', name: 'Creative Nonfiction', units: 3, level: 'k12', gradeLevel: ['12'], program: [createdPrograms.HUMSS] },
    { code: 'SHS-HUMSS3', name: 'Introduction to World Religions', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.HUMSS] },
    { code: 'SHS-HUMSS4', name: 'Trends, Networks, and Critical Thinking', units: 3, level: 'k12', gradeLevel: ['12'], program: [createdPrograms.HUMSS] },
    { code: 'SHS-HUMSS5', name: 'Philippine Politics and Governance', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.HUMSS] },
    { code: 'SHS-HUMSS6', name: 'Community Engagement, Solidarity, and Citizenship', units: 3, level: 'k12', gradeLevel: ['12'], program: [createdPrograms.HUMSS] },
    { code: 'SHS-HUMSS7', name: 'Disciplines and Ideas in the Social Sciences', units: 3, level: 'k12', gradeLevel: ['11'], program: [createdPrograms.HUMSS] },
    { code: 'SHS-HUMSS8', name: 'Disciplines and Ideas in the Applied Social Sciences', units: 3, level: 'k12', gradeLevel: ['12'], program: [createdPrograms.HUMSS] },
  ];

  // College
  const collegeSubjects = [
    // Gen Ed
    { code: 'GE101', name: 'Understanding the Self', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS, createdPrograms.BSIT, createdPrograms.BSED, createdPrograms.BSBA, createdPrograms.BSPSYCH] },
    { code: 'MATH101', name: 'College Algebra', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS, createdPrograms.BSIT, createdPrograms.BSBA] },
    { code: 'ENG101', name: 'Purposive Communication', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS, createdPrograms.BSIT, createdPrograms.BSBA, createdPrograms.BSPSYCH] },

    // BSCS
    { code: 'CS101', name: 'Introduction to Computing', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS, createdPrograms.BSIT] },
    { code: 'CS102', name: 'Programming Fundamentals', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] }, // prereq: CS101
    { code: 'CS201', name: 'Data Structures and Algorithms', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] }, // prereq: CS102
    
    // Additional Programs Core
    { code: 'NUR101', name: 'Theoretical Foundations in Nursing', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSN] },
    { code: 'CE101', name: 'Engineering Drawing', units: 2, level: 'college', category: 'major', program: [createdPrograms.BSCE] },
    { code: 'ARCH101', name: 'Architectural Design 1', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSARCH] },
    { code: 'MGT101', name: 'Principles of Management', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSBA] },
    { code: 'PSY101', name: 'Introduction to Psychology', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSPSYCH] },
  ];

  const allSubjects = [...elemSubjects, ...jhsSubjects, ...shsSubjects, ...collegeSubjects];
  const createdSubjects = {};

  for (const s of allSubjects) {
    const subj = await Subject.findOneAndUpdate(
      { code: s.code, schoolId: school._id },
      { ...s, createdBy: superAdmin._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdSubjects[s.code] = subj._id;
  }

  // 3. Link Prerequisites
  await Subject.findByIdAndUpdate(createdSubjects['SHS-STEM2'], { prerequisites: [createdSubjects['SHS-STEM1']] });
  await Subject.findByIdAndUpdate(createdSubjects['CS102'], { prerequisites: [createdSubjects['CS101']] });
  await Subject.findByIdAndUpdate(createdSubjects['CS201'], { prerequisites: [createdSubjects['CS102']] });

  console.log(`✅ Subjects created and prerequisites linked (${allSubjects.length})`);

  // 4. Create Curriculums
  const Curriculum = require('../models/Curriculum');
  // Removed deleteMany to preserve existing data
  const bscsCurriculum = await Curriculum.findOneAndUpdate(
    { code: 'BSCS-NEW', schoolId: school._id },
    {
      program: createdPrograms.BSCS,
      name: 'BSCS New Curriculum',
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
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const bsnCurriculum = await Curriculum.findOneAndUpdate(
    { code: 'BSN-NEW', schoolId: school._id },
    {
      program: createdPrograms.BSN,
      name: 'BSN New Curriculum',
      version: '1.0',
      effectiveYear: '2025',
      status: 'active',
      subjects: [
        { subject: createdSubjects['NUR101'], yearLevel: 1, semester: '1st', isRequired: true, order: 1 },
        { subject: createdSubjects['GE101'], yearLevel: 1, semester: '1st', isRequired: true, order: 2 },
        { subject: createdSubjects['ENG101'], yearLevel: 1, semester: '1st', isRequired: true, order: 3 },
      ],
      totalUnits: 9,
      createdBy: superAdmin._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('✅ Curriculums created/updated');

  // 5. Create Pre-enrolled Students
  const StudentProfile = require('../models/StudentProfile');
  const Enrollment = require('../models/Enrollment');
  const ClassSchedule = require('../models/ClassSchedule');

  // Removed deleteMany to preserve existing data

  // Create a class schedule for CS101
  const cs101Schedule = await ClassSchedule.findOneAndUpdate(
    { section: 'CS1A', subject: createdSubjects['CS101'], schoolId: school._id },
    {
      teacher: teacher._id,
      academicYear: '2025-2026',
      semester: '1st',
      schedule: [{ day: 'Monday', startTime: '09:00', endTime: '10:30' }, { day: 'Wednesday', startTime: '09:00', endTime: '10:30' }],
      maxStudents: 40,
      status: 'open'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Create BSCS Student (College)
  const collegeStudent = mainStudent;
  
  await StudentProfile.findOneAndUpdate(
    { userId: collegeStudent._id },
    {
      schoolId: school._id, studentId: '26060401',
      program: createdPrograms.BSCS, yearLevel: 1, academicStatus: 'active', enrollmentStatus: 'enrolled',
      course: 'BSCS'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const studentEnrollment = await Enrollment.findOneAndUpdate(
    { student: collegeStudent._id, academicYear: '2025-2026', semester: '1st' },
    {
      schoolId: school._id, levelType: 'college', program: createdPrograms.BSCS, yearLevel: 1, type: 'new',
      status: 'enrolled',
      subjects: [
        { subject: createdSubjects['CS101'], schedule: cs101Schedule._id, units: 3, status: 'enrolled' },
        { subject: createdSubjects['MATH101'], schedule: cs101Schedule._id, units: 3, status: 'enrolled' }
      ],
      totalUnits: 6,
      steps: [
        { step: 'application', status: 'completed' }, { step: 'verification', status: 'completed' },
        { step: 'assessment', status: 'completed' }, { step: 'payment', status: 'completed' },
        { step: 'subject_assignment', status: 'completed' }, { step: 'confirmation', status: 'completed' }
      ]
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Create Grades for mainStudent
  const Grade = require('../models/Grade');
  // Removed deleteMany
  await Grade.findOneAndUpdate(
    { student: collegeStudent._id, subject: createdSubjects['CS101'] },
    {
      schoolId: school._id, teacher: teacher._id,
      schedule: cs101Schedule._id, enrollment: studentEnrollment._id, academicYear: '2025-2026', semester: '1st',
      quizAverage: 95, activityAverage: 92, projectAverage: 96, finalRating: 94.5, remarks: 'Passed', status: 'released',
      releasedAt: new Date()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await Grade.findOneAndUpdate(
    { student: collegeStudent._id, subject: createdSubjects['MATH101'] },
    {
      schoolId: school._id, teacher: teacher._id,
      schedule: cs101Schedule._id, enrollment: studentEnrollment._id, academicYear: '2025-2026', semester: '1st',
      quizAverage: 88, activityAverage: 85, projectAverage: 90, finalRating: 87.6, remarks: 'Passed', status: 'released',
      releasedAt: new Date()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Create Financials for mainStudent
  const { Fee, Assessment, Payment } = require('../models/Financial');
  // Removed deleteMany

  const tuitionFee = await Fee.findOneAndUpdate({ name: 'Tuition Fee (Per Unit)' }, { schoolId: school._id, category: 'tuition', amount: 1500, frequency: 'per_unit' }, { upsert: true, new: true });
  const miscFee = await Fee.findOneAndUpdate({ name: 'Miscellaneous Fee' }, { schoolId: school._id, category: 'miscellaneous', amount: 5000, frequency: 'per_semester' }, { upsert: true, new: true });

  const assessment = await Assessment.findOneAndUpdate(
    { student: collegeStudent._id, academicYear: '2025-2026', semester: '1st' },
    {
      schoolId: school._id, enrollment: studentEnrollment._id,
      fees: [
        { fee: tuitionFee._id, feeName: tuitionFee.name, category: tuitionFee.category, amount: 9000 },
        { fee: miscFee._id, feeName: miscFee.name, category: miscFee.category, amount: 5000 }
      ],
      totalAmount: 14000, discount: 0, scholarship: 0, netAmount: 14000, balance: 0, totalPaid: 14000, status: 'paid'
    },
    { upsert: true, new: true }
  );

  await Payment.findOneAndUpdate(
    { referenceNumber: 'CASH-001' },
    {
      schoolId: school._id, student: collegeStudent._id, assessment: assessment._id, amount: 14000, method: 'cash', status: 'completed',
      paidAt: new Date(), processedBy: superAdmin._id
    },
    { upsert: true, new: true }
  );

  // Create Nursing Student
  const nursingStudent = await User.findOneAndUpdate({ email: 'nursing_student@iscp.edu.ph' }, {
    firstName: 'Florence', lastName: 'Nightingale', email: 'nursing_student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '060426006', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  await StudentProfile.findOneAndUpdate(
    { userId: nursingStudent._id },
    {
      schoolId: school._id, studentId: '060426006',
      program: createdPrograms.BSN, yearLevel: 1, academicStatus: 'active', enrollmentStatus: 'enrolled',
      course: 'BSN'
    },
    { upsert: true, new: true }
  );

  await Enrollment.findOneAndUpdate(
    { student: nursingStudent._id, academicYear: '2025-2026' },
    {
      enrollmentNumber: 'ENR-25-NUR01',
      schoolId: school._id, semester: '1st',
      levelType: 'college', program: createdPrograms.BSN, yearLevel: 1, type: 'new',
      status: 'enrolled',
      subjects: [{ subject: createdSubjects['NUR101'], schedule: cs101Schedule._id, units: 3, status: 'enrolled' }],
      totalUnits: 3,
      steps: [
        { step: 'application', status: 'completed' }, { step: 'verification', status: 'completed' },
        { step: 'assessment', status: 'completed' }, { step: 'payment', status: 'completed' },
        { step: 'subject_assignment', status: 'completed' }, { step: 'confirmation', status: 'completed' }
      ]
    },
    { upsert: true, new: true }
  );

  // Create JHS Student (K-12)
  const jhsStudent = await User.findOneAndUpdate({ email: 'jhs_student@iscp.edu.ph' }, {
    firstName: 'Maria', lastName: 'Junior', email: 'jhs_student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '26060402', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  await StudentProfile.findOneAndUpdate(
    { userId: jhsStudent._id },
    {
      schoolId: school._id, studentId: '26060402',
      program: createdPrograms.JHS, gradeLevel: '7', academicStatus: 'active', enrollmentStatus: 'enrolled'
    },
    { upsert: true, new: true }
  );

  await Enrollment.findOneAndUpdate(
    { student: jhsStudent._id, academicYear: '2025-2026' },
    {
      enrollmentNumber: 'ENR-25-JHS01',
      schoolId: school._id, semester: '1st',
      levelType: 'k12', program: createdPrograms.JHS, gradeLevel: '7', type: 'new',
      status: 'enrolled',
      subjects: [{ subject: createdSubjects['JHS-MATH7'], schedule: cs101Schedule._id, units: 3, status: 'enrolled' }],
      steps: [
        { step: 'application', status: 'completed' }, { step: 'verification', status: 'completed' },
        { step: 'assessment', status: 'completed' }, { step: 'payment', status: 'completed' },
        { step: 'subject_assignment', status: 'completed' }, { step: 'confirmation', status: 'completed' }
      ]
    },
    { upsert: true, new: true }
  );

  // Create Elem Student (K-12)
  const elemStudent = await User.findOneAndUpdate({ email: 'elem_student@iscp.edu.ph' }, {
    firstName: 'Pedro', lastName: 'Elementary', email: 'elem_student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '26060403', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  await StudentProfile.findOneAndUpdate(
    { userId: elemStudent._id },
    {
      schoolId: school._id, studentId: '26060403',
      program: createdPrograms.ELEM, gradeLevel: '1', academicStatus: 'active', enrollmentStatus: 'enrolled'
    },
    { upsert: true, new: true }
  );

  await Enrollment.findOneAndUpdate(
    { student: elemStudent._id, academicYear: '2025-2026' },
    {
      enrollmentNumber: 'ENR-25-ELE01',
      schoolId: school._id, semester: '1st',
      levelType: 'k12', program: createdPrograms.ELEM, gradeLevel: '1', type: 'new',
      status: 'enrolled',
      subjects: [{ subject: createdSubjects['ELEM-MATH1'], schedule: cs101Schedule._id, units: 3, status: 'enrolled' }],
      steps: [
        { step: 'application', status: 'completed' }, { step: 'verification', status: 'completed' },
        { step: 'assessment', status: 'completed' }, { step: 'payment', status: 'completed' },
        { step: 'subject_assignment', status: 'completed' }, { step: 'confirmation', status: 'completed' }
      ]
    },
    { upsert: true, new: true }
  );

  // Create SHS Student (K-12)
  const shsStudent = await User.findOneAndUpdate({ email: 'shs_student@iscp.edu.ph' }, {
    firstName: 'Clara', lastName: 'Senior', email: 'shs_student@iscp.edu.ph',
    password: await bcrypt.hash(process.env.SEED_STUDENT_PASS || defaultPass, 12), role: 'student', schoolId: school._id,
    studentId: '26060404', isActive: true, isEmailVerified: true,
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  await StudentProfile.findOneAndUpdate(
    { userId: shsStudent._id },
    {
      schoolId: school._id, studentId: '26060404',
      program: createdPrograms.STEM, gradeLevel: '11', academicStatus: 'active', enrollmentStatus: 'enrolled'
    },
    { upsert: true, new: true }
  );

  await Enrollment.findOneAndUpdate(
    { student: shsStudent._id, academicYear: '2025-2026' },
    {
      enrollmentNumber: 'ENR-25-SHS01',
      schoolId: school._id, semester: '1st',
      levelType: 'k12', program: createdPrograms.STEM, gradeLevel: '11', type: 'new',
      status: 'enrolled',
      subjects: [{ subject: createdSubjects['SHS-STEM1'], schedule: cs101Schedule._id, units: 3, status: 'enrolled' }],
      steps: [
        { step: 'application', status: 'completed' }, { step: 'verification', status: 'completed' },
        { step: 'assessment', status: 'completed' }, { step: 'payment', status: 'completed' },
        { step: 'subject_assignment', status: 'completed' }, { step: 'confirmation', status: 'completed' }
      ]
    },
    { upsert: true, new: true }
  );
  console.log('✅ Pre-enrolled students created (College, JHS, Elem, SHS)');

  await StudentProfile.findOneAndUpdate(
    { userId: specialStudent._id },
    {
      schoolId: school._id, studentId: '26060405',
      program: createdPrograms.ALS, gradeLevel: 'ALS', academicStatus: 'active', enrollmentStatus: 'enrolled'
    },
    { upsert: true, new: true }
  );

  await Enrollment.findOneAndUpdate(
    { student: specialStudent._id, academicYear: '2025-2026' },
    {
      enrollmentNumber: 'ENR-25-ALS01',
      schoolId: school._id, semester: '1st',
      levelType: 'special', program: createdPrograms.ALS, gradeLevel: 'ALS', type: 'new',
      status: 'enrolled',
      subjects: [],
      totalUnits: 0,
      steps: [
        { step: 'application', status: 'completed' }, { step: 'verification', status: 'completed' },
        { step: 'assessment', status: 'completed' }, { step: 'payment', status: 'completed' },
        { step: 'subject_assignment', status: 'completed' }, { step: 'confirmation', status: 'completed' }
      ]
    },
    { upsert: true, new: true }
  );
  console.log('✅ Pre-enrolled Special Program student created');

  await mongoose.connection.close();
  console.log('\n🎉 Seeding complete!');
};

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
