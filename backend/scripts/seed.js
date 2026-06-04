require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const School = require('../models/School');
const Subject = require('../models/Subject');
const Program = require('../models/Program');
const Curriculum = require('../models/Curriculum');
const StudentProfile = require('../models/StudentProfile');
const Enrollment = require('../models/Enrollment');
const ClassSchedule = require('../models/ClassSchedule');
const Grade = require('../models/Grade');
const { Fee, Assessment, Payment } = require('../models/Financial');
const { CampusLocation, EmployeeProfile, Room, Asset, AuditLog } = require('../models/Campus');
const { Visitor, GatePass, IncidentReport } = require('../models/Services');

const seed = async () => {
  await connectDB();
  console.log('🌱 Connected to database. Preparing to reseed with complete academic structures...');

  const collections = [
    'users', 'schools', 'campuslocations', 'subjects', 'programs',
    'curriculums', 'studentprofiles', 'enrollments', 'classschedules',
    'grades', 'fees', 'assessments', 'payments', 'auditlogs',
    'visitors', 'gatepasses', 'incidentreports'
  ];

  for (const c of collections) {
    try {
      await mongoose.connection.collection(c).deleteMany({});
      console.log(`🧹 Cleared collection: ${c}`);
    } catch (err) {
      console.log(`⚠️ Skip clear: ${c} - ${err.message}`);
    }
  }

  console.log('✅ Collections cleared.');

  // 1. Create School (Tenant)
  const school = await School.create({
    name: 'International State Colleges of the Philippines',
    abbreviation: 'ISCP',
    tagline: 'Filipinos Sultus Es',
    logo: '/iscp-logo.jpg',
    address: { city: 'Manila', province: 'Metro Manila', country: 'Philippines' },
    contact: { email: 'info@iscp.edu.ph', phone: '+63-2-8888-0000', website: 'https://iscp.edu.ph' },
    settings: {
      schoolLevel: 'both',
      academicYear: '2025-2026',
      currentSemester: '1st',
      gradingSystem: 'percentage',
      passingGrade: 75,
      currency: 'PHP',
      enableOnlineEnrollment: true,
      enableParentPortal: true,
      enableLMS: true
    }
  });
  console.log('✅ Main School tenant created: ISCP');

  // 2. Create Campus Locations
  const campusManila = await CampusLocation.create({
    schoolId: school._id,
    name: 'ISCP Manila Campus',
    code: 'ISCP-MNL',
    address: { street: 'Mendiola St', city: 'Manila', province: 'Metro Manila', zipCode: '1005', country: 'Philippines' },
    contact: { email: 'manila@iscp.edu.ph', phone: '+63-2-8888-0001' },
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=60'
  });

  const campusCebu = await CampusLocation.create({
    schoolId: school._id,
    name: 'ISCP Cebu Campus',
    code: 'ISCP-CEB',
    address: { street: 'Gorordo Ave', city: 'Cebu City', province: 'Cebu', zipCode: '6000', country: 'Philippines' },
    contact: { email: 'cebu@iscp.edu.ph', phone: '+63-32-8888-0002' },
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=60'
  });

  const campusDavao = await CampusLocation.create({
    schoolId: school._id,
    name: 'ISCP Davao Campus',
    code: 'ISCP-DVO',
    address: { street: 'Roxas Ave', city: 'Davao City', province: 'Davao del Sur', zipCode: '8000', country: 'Philippines' },
    contact: { email: 'davao@iscp.edu.ph', phone: '+63-82-8888-0003' },
    imageUrl: 'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=600&auto=format&fit=crop&q=60'
  });

  const campusMindanao = await CampusLocation.create({
    schoolId: school._id,
    name: 'ISCP Mindanao Campus',
    code: 'ISCP-MIN',
    address: { street: 'Aluba Rd', city: 'Cagayan de Oro', province: 'Misamis Oriental', zipCode: '9000', country: 'Philippines' },
    contact: { email: 'mindanao@iscp.edu.ph', phone: '+63-88-8888-0004' },
    imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?w=600&auto=format&fit=crop&q=60'
  });

  console.log('✅ Campus Locations created (Manila, Cebu, Davao, Mindanao)');

  // 3. Create Users
  const defaultPass = process.env.SEED_DEFAULT_PASS || 'Passw0rd123!';
  const defaultHash = await bcrypt.hash(defaultPass, 12);

  const superAdmin = await User.create({
    firstName: 'Super', lastName: 'Admin', email: 'superadmin@iscp.edu.ph',
    password: defaultPass, role: 'super_admin', isActive: true, isEmailVerified: true,
    schoolId: school._id, phone: '+639170000000'
  });

  const principal = await User.create({
    firstName: 'Maria', lastName: 'Cruz', email: 'principal@iscp.edu.ph',
    password: defaultPass, role: 'principal', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  const registrar = await User.create({
    firstName: 'Ana', lastName: 'Reyes', email: 'registrar@iscp.edu.ph',
    password: defaultPass, role: 'registrar', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  const teacher = await User.create({
    firstName: 'Juan', lastName: 'dela Cruz', email: 'teacher@iscp.edu.ph',
    password: defaultPass, role: 'teacher', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  const cashier = await User.create({
    firstName: 'Rosa', lastName: 'Garcia', email: 'cashier@iscp.edu.ph',
    password: defaultPass, role: 'cashier', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  const librarian = await User.create({
    firstName: 'Leonor', lastName: 'Orosa', email: 'librarian@iscp.edu.ph',
    password: defaultPass, role: 'librarian', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  const nurse = await User.create({
    firstName: 'Clara', lastName: 'Barton', email: 'nurse@iscp.edu.ph',
    password: defaultPass, role: 'nurse', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  const hr = await User.create({
    firstName: 'Michael', lastName: 'Scott', email: 'hr@iscp.edu.ph',
    password: defaultPass, role: 'hr_staff', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  const student = await User.create({
    firstName: 'Jose', lastName: 'Rizal', email: 'student@iscp.edu.ph',
    password: defaultPass, role: 'student', isActive: true, isEmailVerified: true,
    schoolId: school._id, studentId: '26060401'
  });

  const parent = await User.create({
    firstName: 'Francisco', lastName: 'Rizal', email: 'parent@iscp.edu.ph',
    password: defaultPass, role: 'parent', isActive: true, isEmailVerified: true,
    schoolId: school._id, children: [student._id]
  });

  student.parentOf = [parent._id];
  await student.save();

  console.log('✅ Standard Users created');

  // 4. Create Academic Programs
  const programsData = [
    { code: 'ELEM', name: 'Elementary Education', type: 'k12', level: 'elementary', duration: 6 },
    { code: 'JHS', name: 'Junior High School', type: 'k12', level: 'junior_high', duration: 4 },
    { code: 'STEM', name: 'Science, Technology, Engineering, and Mathematics', type: 'k12', level: 'senior_high', duration: 2, strand: 'STEM', track: 'Academic' },
    { code: 'BSCS', name: 'Bachelor of Science in Computer Science', type: 'college', level: 'bachelor', duration: 4 }
  ];

  const createdPrograms = {};
  for (const p of programsData) {
    const prog = await Program.create({ ...p, schoolId: school._id, createdBy: superAdmin._id });
    createdPrograms[p.code] = prog._id;
  }
  console.log(`✅ Programs created (${programsData.length})`);

  // 5. Create Subjects
  
  // 5.1 Elementary Subjects (Exactly 8 subjects)
  const elemSubjectsData = [
    { code: 'ELEM-ENG1', name: 'English Language Arts 1', units: 1, level: 'k12', gradeLevel: ['1'], category: 'core', program: [createdPrograms.ELEM] },
    { code: 'ELEM-MATH1', name: 'Mathematics 1', units: 1, level: 'k12', gradeLevel: ['1'], category: 'core', program: [createdPrograms.ELEM] },
    { code: 'ELEM-SCI1', name: 'Science and Health 1', units: 1, level: 'k12', gradeLevel: ['1'], category: 'core', program: [createdPrograms.ELEM] },
    { code: 'ELEM-FIL1', name: 'Filipino 1 (Wika at Pagbasa)', units: 1, level: 'k12', gradeLevel: ['1'], category: 'core', program: [createdPrograms.ELEM] },
    { code: 'ELEM-AP1', name: 'Araling Panlipunan 1', units: 1, level: 'k12', gradeLevel: ['1'], category: 'core', program: [createdPrograms.ELEM] },
    { code: 'ELEM-MAPEH1', name: 'MAPEH 1 (Music, Art, PE, Health)', units: 1, level: 'k12', gradeLevel: ['1'], category: 'core', program: [createdPrograms.ELEM] },
    { code: 'ELEM-ESP1', name: 'Edukasyon sa Pagpapakatao 1', units: 1, level: 'k12', gradeLevel: ['1'], category: 'core', program: [createdPrograms.ELEM] },
    { code: 'ELEM-COMP1', name: 'Computer Literacy 1', units: 1, level: 'k12', gradeLevel: ['1'], category: 'elective', program: [createdPrograms.ELEM] }
  ];

  const elemSubjects = [];
  for (const s of elemSubjectsData) {
    const subj = await Subject.create({ ...s, schoolId: school._id, createdBy: superAdmin._id });
    elemSubjects.push(subj);
  }
  console.log('✅ Seeding 8 Elementary Subjects complete');

  // 5.2 Junior High School Subjects (Exactly 8 subjects)
  const jhsSubjectsData = [
    { code: 'JHS-ENG7', name: 'English 7 (Introduction to Literature)', units: 1, level: 'k12', gradeLevel: ['7'], category: 'core', program: [createdPrograms.JHS] },
    { code: 'JHS-MATH7', name: 'Mathematics 7 (Intermediate Algebra)', units: 1, level: 'k12', gradeLevel: ['7'], category: 'core', program: [createdPrograms.JHS] },
    { code: 'JHS-SCI7', name: 'Integrated Science 7', units: 1, level: 'k12', gradeLevel: ['7'], category: 'core', program: [createdPrograms.JHS] },
    { code: 'JHS-FIL7', name: 'Filipino 7 (Panitikang Pilipino)', units: 1, level: 'k12', gradeLevel: ['7'], category: 'core', program: [createdPrograms.JHS] },
    { code: 'JHS-AP7', name: 'Araling Panlipunan 7 (Kasaysayan ng Asya)', units: 1, level: 'k12', gradeLevel: ['7'], category: 'core', program: [createdPrograms.JHS] },
    { code: 'JHS-MAPEH7', name: 'MAPEH 7 (Physical Education and Health Focus)', units: 1, level: 'k12', gradeLevel: ['7'], category: 'core', program: [createdPrograms.JHS] },
    { code: 'JHS-ESP7', name: 'Edukasyon sa Pagpapakatao 7', units: 1, level: 'k12', gradeLevel: ['7'], category: 'core', program: [createdPrograms.JHS] },
    { code: 'JHS-TLE7', name: 'Technology and Livelihood Education 7', units: 1, level: 'k12', gradeLevel: ['7'], category: 'major', program: [createdPrograms.JHS] }
  ];

  const jhsSubjects = [];
  for (const s of jhsSubjectsData) {
    const subj = await Subject.create({ ...s, schoolId: school._id, createdBy: superAdmin._id });
    jhsSubjects.push(subj);
  }
  console.log('✅ Seeding 8 Junior High School Subjects complete');

  // 5.3 Senior High School (STEM) Subjects (10 subjects: 8-12 requirement)
  const shsSubjectsData = [
    { code: 'STEM-GENMATH', name: 'General Mathematics', units: 4, level: 'k12', gradeLevel: ['11'], category: 'core', program: [createdPrograms.STEM] },
    { code: 'STEM-PRECAL', name: 'Pre-Calculus', units: 4, level: 'k12', gradeLevel: ['11'], category: 'major', program: [createdPrograms.STEM] },
    { code: 'STEM-CHEM1', name: 'General Chemistry 1', units: 4, level: 'k12', gradeLevel: ['11'], category: 'major', program: [createdPrograms.STEM] },
    { code: 'STEM-BIO1', name: 'General Biology 1', units: 4, level: 'k12', gradeLevel: ['11'], category: 'major', program: [createdPrograms.STEM] },
    { code: 'STEM-ORALCOM', name: 'Oral Communication in Context', units: 3, level: 'k12', gradeLevel: ['11'], category: 'core', program: [createdPrograms.STEM] },
    { code: 'STEM-KOM', name: 'Komunikasyon at Pananaliksik sa Wika', units: 3, level: 'k12', gradeLevel: ['11'], category: 'core', program: [createdPrograms.STEM] },
    { code: 'STEM-PE1', name: 'Physical Education and Health 1', units: 2, level: 'k12', gradeLevel: ['11'], category: 'core', program: [createdPrograms.STEM] },
    { code: 'STEM-PHYS1', name: 'General Physics 1', units: 4, level: 'k12', gradeLevel: ['11'], category: 'major', program: [createdPrograms.STEM] },
    { code: 'STEM-EMPTECH', name: 'Empowerment Technologies', units: 3, level: 'k12', gradeLevel: ['11'], category: 'core', program: [createdPrograms.STEM] },
    { code: 'STEM-PERDEV', name: 'Personal Development', units: 3, level: 'k12', gradeLevel: ['11'], category: 'core', program: [createdPrograms.STEM] }
  ];

  const shsSubjects = [];
  for (const s of shsSubjectsData) {
    const subj = await Subject.create({ ...s, schoolId: school._id, createdBy: superAdmin._id });
    shsSubjects.push(subj);
  }
  console.log('✅ Seeding 10 Senior High STEM Subjects complete');

  // 5.4 College BSCS Subjects (Regular load of 8 subjects for 1st Year, 1st Semester)
  const collegeSubjectsData = [
    // 1st Year, 1st Semester (8 Subjects, 23 Units)
    { code: 'CS-101', name: 'Introduction to Computing', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] },
    { code: 'CS-102', name: 'Computer Programming 1', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] },
    { code: 'GE-101', name: 'Understanding the Self', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS] },
    { code: 'GE-102', name: 'Readings in Philippine History', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS] },
    { code: 'GE-103', name: 'The Contemporary World', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS] },
    { code: 'ENG-101', name: 'Purposive Communication', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS] },
    { code: 'NSTP-1', name: 'National Service Training Program 1', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS] },
    { code: 'PE-1', name: 'Physical Education 1: Physical Fitness', units: 2, level: 'college', category: 'core', program: [createdPrograms.BSCS] },

    // 1st Year, 2nd Semester (Prerequisites targets)
    { code: 'CS-103', name: 'Computer Programming 2', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] },
    { code: 'CS-104', name: 'Discrete Structures', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] },

    // 2nd Year, 1st Semester
    { code: 'CS-201', name: 'Data Structures and Algorithms', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] }
  ];

  const collegeSubjects = {};
  for (const s of collegeSubjectsData) {
    const subj = await Subject.create({ ...s, schoolId: school._id, createdBy: superAdmin._id });
    collegeSubjects[s.code] = subj;
  }

  // Link college prerequisites
  await Subject.findByIdAndUpdate(collegeSubjects['CS-103']._id, { prerequisites: [collegeSubjects['CS-102']._id] });
  await Subject.findByIdAndUpdate(collegeSubjects['CS-104']._id, { prerequisites: [collegeSubjects['CS-102']._id] });
  await Subject.findByIdAndUpdate(collegeSubjects['CS-201']._id, { prerequisites: [collegeSubjects['CS-103']._id] });

  console.log('✅ College Subjects created with correct prerequisite linkages');

  // 6. Create Curriculums
  
  // 6.1 Elementary Curriculum
  await Curriculum.create({
    program: createdPrograms.ELEM,
    schoolId: school._id,
    code: 'ELEM-CURR',
    name: 'Elementary K-12 Curriculum',
    version: '1.0',
    effectiveYear: '2025',
    status: 'active',
    subjects: elemSubjects.map((s, idx) => ({ subject: s._id, yearLevel: 1, semester: '1st', isRequired: true, order: idx + 1 })),
    totalUnits: elemSubjects.length,
    createdBy: superAdmin._id
  });

  // 6.2 JHS Curriculum
  await Curriculum.create({
    program: createdPrograms.JHS,
    schoolId: school._id,
    code: 'JHS-CURR',
    name: 'Junior High K-12 Curriculum',
    version: '1.0',
    effectiveYear: '2025',
    status: 'active',
    subjects: jhsSubjects.map((s, idx) => ({ subject: s._id, yearLevel: 7, semester: '1st', isRequired: true, order: idx + 1 })),
    totalUnits: jhsSubjects.length,
    createdBy: superAdmin._id
  });

  // 6.3 STEM Curriculum
  await Curriculum.create({
    program: createdPrograms.STEM,
    schoolId: school._id,
    code: 'STEM-CURR',
    name: 'SHS STEM Curriculum',
    version: '1.0',
    effectiveYear: '2025',
    status: 'active',
    subjects: shsSubjects.map((s, idx) => ({ subject: s._id, yearLevel: 11, semester: '1st', isRequired: true, order: idx + 1 })),
    totalUnits: shsSubjects.length,
    createdBy: superAdmin._id
  });

  // 6.4 College BSCS Curriculum
  const bscsCurriculum = await Curriculum.create({
    program: createdPrograms.BSCS,
    schoolId: school._id,
    code: 'BSCS-2025',
    name: 'BSCS New Curriculum',
    version: '1.0',
    effectiveYear: '2025',
    status: 'active',
    subjects: [
      { subject: collegeSubjects['CS-101']._id, yearLevel: 1, semester: '1st', isRequired: true, order: 1 },
      { subject: collegeSubjects['CS-102']._id, yearLevel: 1, semester: '1st', isRequired: true, order: 2 },
      { subject: collegeSubjects['GE-101']._id, yearLevel: 1, semester: '1st', isRequired: true, order: 3 },
      { subject: collegeSubjects['GE-102']._id, yearLevel: 1, semester: '1st', isRequired: true, order: 4 },
      { subject: collegeSubjects['GE-103']._id, yearLevel: 1, semester: '1st', isRequired: true, order: 5 },
      { subject: collegeSubjects['ENG-101']._id, yearLevel: 1, semester: '1st', isRequired: true, order: 6 },
      { subject: collegeSubjects['NSTP-1']._id, yearLevel: 1, semester: '1st', isRequired: true, order: 7 },
      { subject: collegeSubjects['PE-1']._id, yearLevel: 1, semester: '1st', isRequired: true, order: 8 },

      { subject: collegeSubjects['CS-103']._id, yearLevel: 1, semester: '2nd', isRequired: true, order: 1 },
      { subject: collegeSubjects['CS-104']._id, yearLevel: 1, semester: '2nd', isRequired: true, order: 2 },

      { subject: collegeSubjects['CS-201']._id, yearLevel: 2, semester: '1st', isRequired: true, order: 1 }
    ],
    totalUnits: 29,
    createdBy: superAdmin._id
  });

  console.log('✅ Curriculums created (ELEM, JHS, STEM, BSCS)');

  // 7. Create Class Schedules for all 8 College Subjects in 1st Semester
  const schedulesList = [
    { subject: 'CS-101', section: 'CS-1A', day: 'Monday', startTime: '07:30', endTime: '09:00', room: 'Lab 101' },
    { subject: 'CS-102', section: 'CS-1A', day: 'Monday', startTime: '09:00', endTime: '10:30', room: 'Lab 101' },
    { subject: 'GE-101', section: 'CS-1A', day: 'Tuesday', startTime: '07:30', endTime: '09:00', room: 'Room 301' },
    { subject: 'GE-102', section: 'CS-1A', day: 'Tuesday', startTime: '09:00', endTime: '10:30', room: 'Room 301' },
    { subject: 'GE-103', section: 'CS-1A', day: 'Wednesday', startTime: '10:30', endTime: '12:00', room: 'Room 301' },
    { subject: 'ENG-101', section: 'CS-1A', day: 'Wednesday', startTime: '13:00', endTime: '14:30', room: 'Room 302' },
    { subject: 'NSTP-1', section: 'CS-1A', day: 'Saturday', startTime: '08:00', endTime: '11:00', room: 'Grand Field' },
    { subject: 'PE-1', section: 'CS-1A', day: 'Friday', startTime: '10:00', endTime: '12:00', room: 'Gymnasium' }
  ];

  const createdSchedules = {};
  for (const s of schedulesList) {
    const targetSubject = collegeSubjects[s.subject];
    const sched = await ClassSchedule.create({
      schoolId: school._id,
      subject: targetSubject._id,
      teacher: teacher._id,
      academicYear: '2025-2026',
      semester: '1st',
      section: s.section,
      schedule: [
        { day: s.day, startTime: s.startTime, endTime: s.endTime, room: s.room }
      ],
      maxStudents: 45,
      status: 'open'
    });
    createdSchedules[s.subject] = sched;
  }

  console.log('✅ Class Schedules created for all 8 core semester subjects');

  // 8. Create Student Profile
  const studentProfile = await StudentProfile.create({
    userId: student._id,
    schoolId: school._id,
    studentId: '26060401',
    program: createdPrograms.BSCS,
    yearLevel: 1,
    academicStatus: 'active',
    enrollmentStatus: 'enrolled',
    course: 'BSCS',
    birthPlace: 'Calamba, Laguna',
    citizenship: 'Filipino',
    guardian: {
      name: 'Francisco Rizal',
      relationship: 'Father',
      contactNumber: '+639171112222',
      email: 'parent@iscp.edu.ph',
      address: 'Calamba, Laguna'
    },
    documents: [
      { type: 'birth_certificate', url: '/mock-files/birth_certificate.pdf', verified: true },
      { type: 'report_card', url: '/mock-files/report_card.pdf', verified: true }
    ],
    createdBy: superAdmin._id
  });

  // 9. Create Enrollment with all 8 subjects loaded
  const enrollment = await Enrollment.create({
    schoolId: school._id,
    student: student._id,
    studentProfile: studentProfile._id,
    enrollmentNumber: 'ENR-25-00001',
    academicYear: '2025-2026',
    semester: '1st',
    type: 'new',
    levelType: 'college',
    campus: campusManila._id,
    program: createdPrograms.BSCS,
    yearLevel: 1,
    status: 'enrolled',
    subjects: [
      { subject: collegeSubjects['CS-101']._id, schedule: createdSchedules['CS-101']._id, units: 3, status: 'enrolled' },
      { subject: collegeSubjects['CS-102']._id, schedule: createdSchedules['CS-102']._id, units: 3, status: 'enrolled' },
      { subject: collegeSubjects['GE-101']._id, schedule: createdSchedules['GE-101']._id, units: 3, status: 'enrolled' },
      { subject: collegeSubjects['GE-102']._id, schedule: createdSchedules['GE-102']._id, units: 3, status: 'enrolled' },
      { subject: collegeSubjects['GE-103']._id, schedule: createdSchedules['GE-103']._id, units: 3, status: 'enrolled' },
      { subject: collegeSubjects['ENG-101']._id, schedule: createdSchedules['ENG-101']._id, units: 3, status: 'enrolled' },
      { subject: collegeSubjects['NSTP-1']._id, schedule: createdSchedules['NSTP-1']._id, units: 3, status: 'enrolled' },
      { subject: collegeSubjects['PE-1']._id, schedule: createdSchedules['PE-1']._id, units: 2, status: 'enrolled' }
    ],
    totalUnits: 23,
    steps: [
      { step: 'application', status: 'completed', completedAt: new Date() },
      { step: 'verification', status: 'completed', completedAt: new Date() },
      { step: 'assessment', status: 'completed', completedAt: new Date() },
      { step: 'payment', status: 'completed', completedAt: new Date() },
      { step: 'subject_assignment', status: 'completed', completedAt: new Date() },
      { step: 'confirmation', status: 'completed', completedAt: new Date() }
    ],
    createdBy: superAdmin._id
  });

  // 10. Create Grades for some subjects
  await Grade.create({
    schoolId: school._id, student: student._id, subject: collegeSubjects['CS-101']._id,
    teacher: teacher._id, schedule: createdSchedules['CS-101']._id, enrollment: enrollment._id,
    academicYear: '2025-2026', semester: '1st',
    quizAverage: 95, activityAverage: 92, projectAverage: 96, finalRating: 94.5,
    remarks: 'Passed', status: 'released', releasedAt: new Date()
  });

  await Grade.create({
    schoolId: school._id, student: student._id, subject: collegeSubjects['GE-101']._id,
    teacher: teacher._id, schedule: createdSchedules['GE-101']._id, enrollment: enrollment._id,
    academicYear: '2025-2026', semester: '1st',
    quizAverage: 88, activityAverage: 85, projectAverage: 90, finalRating: 87.6,
    remarks: 'Passed', status: 'released', releasedAt: new Date()
  });

  console.log('✅ Student Profile, Enrollment with 8 subjects, and initial Grades created');

  // 11. Create Fees, Assessment, and Payments
  const tuitionFee = await Fee.create({ name: 'Tuition Fee (Per Unit)', category: 'tuition', amount: 1500, frequency: 'per_unit', schoolId: school._id });
  const miscFee = await Fee.create({ name: 'Miscellaneous Fee', category: 'miscellaneous', amount: 5000, frequency: 'per_semester', schoolId: school._id });

  const assessment = await Assessment.create({
    schoolId: school._id,
    student: student._id,
    enrollment: enrollment._id,
    academicYear: '2025-2026',
    semester: '1st',
    fees: [
      { fee: tuitionFee._id, feeName: tuitionFee.name, category: tuitionFee.category, amount: 34500, units: 23 },
      { fee: miscFee._id, feeName: miscFee.name, category: miscFee.category, amount: 5000 }
    ],
    totalAmount: 39500,
    netAmount: 39500,
    totalPaid: 35000,
    balance: 4500,
    status: 'partial',
    createdBy: superAdmin._id
  });

  await Payment.create({
    schoolId: school._id,
    student: student._id,
    assessment: assessment._id,
    referenceNumber: 'PAY-25-000001',
    amount: 35000,
    method: 'cash',
    status: 'completed',
    processedBy: cashier._id,
    paidAt: new Date(),
    createdBy: cashier._id
  });

  console.log('✅ Fees, Assessment, and partial Payment seeded (for student checkout testing)');

  // 12. Create Audit Logs
  const auditLogsData = [
    { action: 'LOGIN', module: 'Auth', description: 'Super Admin logged in', ip: '192.168.1.1', status: 'success' },
    { action: 'CREATE', module: 'School', description: 'Main School tenant created: ISCP', ip: '192.168.1.1', status: 'success' },
    { action: 'CREATE', module: 'Campus', description: 'ISCP Manila Campus registered', ip: '192.168.1.1', status: 'success' },
    { action: 'CREATE', module: 'User', description: 'Created student account: student@iscp.edu.ph', ip: '192.168.1.20', status: 'success' },
    { action: 'ENROLL', module: 'Enrollment', description: 'Enrolled student in BSCS (regular load 8 subjects)', ip: '192.168.1.30', status: 'success' },
    { action: 'PAY', module: 'Financial', description: 'Seeded initial payment of 35,000 PHP', ip: '192.168.1.5', status: 'success' }
  ];

  for (const log of auditLogsData) {
    await AuditLog.create({
      ...log,
      schoolId: school._id,
      user: superAdmin._id
    });
  }
  console.log('✅ Audit Logs seeded');

  // 13. Create Visitors & Gate Passes
  await Visitor.create({
    schoolId: school._id,
    firstName: 'Juan',
    lastName: 'Perez',
    phone: '09187778888',
    purpose: 'Inquire about admission requirements',
    personToVisit: 'Admission Office',
    department: 'Registrar',
    idType: 'Driver\'s License',
    idNumber: 'D01-99-123456',
    vehiclePlate: 'XYZ-9876',
    timeIn: new Date(),
    status: 'checked_in',
    approvedBy: registrar._id
  });

  await Visitor.create({
    schoolId: school._id,
    firstName: 'Maria',
    lastName: 'Santos',
    phone: '09192223333',
    purpose: 'Deliver school supplies',
    personToVisit: 'Property Office',
    department: 'Admin',
    idType: 'SSS ID',
    idNumber: '03-1234567-8',
    timeIn: new Date(Date.now() - 3600000 * 3),
    timeOut: new Date(Date.now() - 3600000 * 2),
    status: 'checked_out',
    approvedBy: registrar._id
  });

  await GatePass.create({
    schoolId: school._id,
    person: student._id,
    personType: 'student',
    reason: 'Dental Appointment',
    destination: 'Dental Clinic',
    timeOut: new Date(),
    status: 'approved',
    approvedBy: principal._id,
    approvedAt: new Date(),
    qrCode: 'MOCK-QR-GATEPASS-CODE'
  });

  console.log('✅ Visitors and Gate Passes seeded');

  await mongoose.connection.close();
  console.log('\n🎉 Reseed operations complete!');
};

seed().catch(err => {
  console.error('❌ Reseed error:', err);
  process.exit(1);
});
