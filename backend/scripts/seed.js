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
  console.log('🌱 Connected to database. Preparing to reseed...');

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

  // Super Admin
  const superAdmin = await User.create({
    firstName: 'Super', lastName: 'Admin', email: 'superadmin@iscp.edu.ph',
    password: defaultPass, role: 'super_admin', isActive: true, isEmailVerified: true,
    schoolId: school._id, phone: '+639170000000'
  });

  // Principal
  const principal = await User.create({
    firstName: 'Maria', lastName: 'Cruz', email: 'principal@iscp.edu.ph',
    password: defaultPass, role: 'principal', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  // Registrar
  const registrar = await User.create({
    firstName: 'Ana', lastName: 'Reyes', email: 'registrar@iscp.edu.ph',
    password: defaultPass, role: 'registrar', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  // Teacher
  const teacher = await User.create({
    firstName: 'Juan', lastName: 'dela Cruz', email: 'teacher@iscp.edu.ph',
    password: defaultPass, role: 'teacher', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  // Cashier
  const cashier = await User.create({
    firstName: 'Rosa', lastName: 'Garcia', email: 'cashier@iscp.edu.ph',
    password: defaultPass, role: 'cashier', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  // Librarian
  const librarian = await User.create({
    firstName: 'Leonor', lastName: 'Orosa', email: 'librarian@iscp.edu.ph',
    password: defaultPass, role: 'librarian', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  // Nurse
  const nurse = await User.create({
    firstName: 'Clara', lastName: 'Barton', email: 'nurse@iscp.edu.ph',
    password: defaultPass, role: 'nurse', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  // HR
  const hr = await User.create({
    firstName: 'Michael', lastName: 'Scott', email: 'hr@iscp.edu.ph',
    password: defaultPass, role: 'hr_staff', isActive: true, isEmailVerified: true,
    schoolId: school._id
  });

  // Student (Jose Rizal)
  const student = await User.create({
    firstName: 'Jose', lastName: 'Rizal', email: 'student@iscp.edu.ph',
    password: defaultPass, role: 'student', isActive: true, isEmailVerified: true,
    schoolId: school._id, studentId: '26060401'
  });

  // Parent (Francisco Rizal)
  const parent = await User.create({
    firstName: 'Francisco', lastName: 'Rizal', email: 'parent@iscp.edu.ph',
    password: defaultPass, role: 'parent', isActive: true, isEmailVerified: true,
    schoolId: school._id, children: [student._id]
  });

  // Link student back to parent
  student.parentOf = [parent._id];
  await student.save();

  console.log('✅ Standard Users created');

  // 4. Create Academic Programs
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
    { code: 'ALS', name: 'Alternative Learning System (ALS)', type: 'vocational', level: 'junior_high', duration: 1 },
    { code: 'SPED', name: 'Special Education (SPED)', type: 'vocational', level: 'elementary', duration: 1 }
  ];

  const createdPrograms = {};
  for (const p of programsData) {
    const prog = await Program.create({ ...p, schoolId: school._id, createdBy: superAdmin._id });
    createdPrograms[p.code] = prog._id;
  }
  console.log(`✅ Programs created (${programsData.length})`);

  // 5. Create Subjects
  const collegeSubjects = [
    { code: 'GE101', name: 'Understanding the Self', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS, createdPrograms.BSN] },
    { code: 'MATH101', name: 'College Algebra', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS] },
    { code: 'ENG101', name: 'Purposive Communication', units: 3, level: 'college', category: 'core', program: [createdPrograms.BSCS, createdPrograms.BSN] },
    { code: 'CS101', name: 'Introduction to Computing', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] },
    { code: 'CS102', name: 'Programming Fundamentals', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] }, // prereq: CS101
    { code: 'CS201', name: 'Data Structures and Algorithms', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSCS] }, // prereq: CS102
    { code: 'NUR101', name: 'Theoretical Foundations in Nursing', units: 3, level: 'college', category: 'major', program: [createdPrograms.BSN] }
  ];

  const createdSubjects = {};
  for (const s of collegeSubjects) {
    const subj = await Subject.create({ ...s, schoolId: school._id, createdBy: superAdmin._id });
    createdSubjects[s.code] = subj._id;
  }

  // Link prerequisites
  await Subject.findByIdAndUpdate(createdSubjects['CS102'], { prerequisites: [createdSubjects['CS101']] });
  await Subject.findByIdAndUpdate(createdSubjects['CS201'], { prerequisites: [createdSubjects['CS102']] });

  console.log('✅ College Subjects created with prerequisite linkages');

  // 6. Create Curriculums
  const bscsCurriculum = await Curriculum.create({
    program: createdPrograms.BSCS,
    schoolId: school._id,
    code: 'BSCS-2025',
    name: 'BSCS New Curriculum',
    version: '1.0',
    effectiveYear: '2025',
    status: 'active',
    subjects: [
      { subject: createdSubjects['GE101'], yearLevel: 1, semester: '1st', isRequired: true, order: 1 },
      { subject: createdSubjects['MATH101'], yearLevel: 1, semester: '1st', isRequired: true, order: 2 },
      { subject: createdSubjects['CS101'], yearLevel: 1, semester: '1st', isRequired: true, order: 3 },
      { subject: createdSubjects['CS102'], yearLevel: 1, semester: '2nd', isRequired: true, order: 1 },
      { subject: createdSubjects['CS201'], yearLevel: 2, semester: '1st', isRequired: true, order: 1 }
    ],
    totalUnits: 15,
    createdBy: superAdmin._id
  });

  const bsnCurriculum = await Curriculum.create({
    program: createdPrograms.BSN,
    schoolId: school._id,
    code: 'BSN-2025',
    name: 'BSN New Curriculum',
    version: '1.0',
    effectiveYear: '2025',
    status: 'active',
    subjects: [
      { subject: createdSubjects['NUR101'], yearLevel: 1, semester: '1st', isRequired: true, order: 1 },
      { subject: createdSubjects['GE101'], yearLevel: 1, semester: '1st', isRequired: true, order: 2 },
      { subject: createdSubjects['ENG101'], yearLevel: 1, semester: '1st', isRequired: true, order: 3 }
    ],
    totalUnits: 9,
    createdBy: superAdmin._id
  });

  console.log('✅ Curriculums created (BSCS, BSN)');

  // 7. Create Class Schedules
  const scheduleCS101 = await ClassSchedule.create({
    schoolId: school._id,
    subject: createdSubjects['CS101'],
    teacher: teacher._id,
    academicYear: '2025-2026',
    semester: '1st',
    section: 'CS1-A',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '10:30', room: 'Lab 101' },
      { day: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'Lab 101' }
    ],
    maxStudents: 40,
    status: 'open'
  });

  const scheduleMATH101 = await ClassSchedule.create({
    schoolId: school._id,
    subject: createdSubjects['MATH101'],
    teacher: teacher._id,
    academicYear: '2025-2026',
    semester: '1st',
    section: 'CS1-A',
    schedule: [
      { day: 'Tuesday', startTime: '10:30', endTime: '12:00', room: 'Room 302' },
      { day: 'Thursday', startTime: '10:30', endTime: '12:00', room: 'Room 302' }
    ],
    maxStudents: 40,
    status: 'open'
  });

  console.log('✅ Class Schedules created');

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

  // 9. Create Enrollment
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
      { subject: createdSubjects['CS101'], schedule: scheduleCS101._id, units: 3, status: 'enrolled' },
      { subject: createdSubjects['MATH101'], schedule: scheduleMATH101._id, units: 3, status: 'enrolled' }
    ],
    totalUnits: 6,
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

  // 10. Create Grades
  await Grade.create({
    schoolId: school._id, student: student._id, subject: createdSubjects['CS101'],
    teacher: teacher._id, schedule: scheduleCS101._id, enrollment: enrollment._id,
    academicYear: '2025-2026', semester: '1st',
    quizAverage: 95, activityAverage: 92, projectAverage: 96, finalRating: 94.5,
    remarks: 'Passed', status: 'released', releasedAt: new Date()
  });

  await Grade.create({
    schoolId: school._id, student: student._id, subject: createdSubjects['MATH101'],
    teacher: teacher._id, schedule: scheduleMATH101._id, enrollment: enrollment._id,
    academicYear: '2025-2026', semester: '1st',
    quizAverage: 88, activityAverage: 85, projectAverage: 90, finalRating: 87.6,
    remarks: 'Passed', status: 'released', releasedAt: new Date()
  });

  console.log('✅ Student Profile, Enrollment, and Grades created');

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
      { fee: tuitionFee._id, feeName: tuitionFee.name, category: tuitionFee.category, amount: 9000, units: 6 },
      { fee: miscFee._id, feeName: miscFee.name, category: miscFee.category, amount: 5000 }
    ],
    totalAmount: 14000,
    netAmount: 14000,
    totalPaid: 10000,
    balance: 4000,
    status: 'partial',
    createdBy: superAdmin._id
  });

  await Payment.create({
    schoolId: school._id,
    student: student._id,
    assessment: assessment._id,
    referenceNumber: 'PAY-25-000001',
    amount: 10000,
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
    { action: 'ENROLL', module: 'Enrollment', description: 'Enrolled student in BSCS', ip: '192.168.1.30', status: 'success' },
    { action: 'PAY', module: 'Financial', description: 'Seeded initial payment of 10,000 PHP', ip: '192.168.1.5', status: 'success' }
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
