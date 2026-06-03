const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { EmployeeProfile, AuditLog } = require('../models/Campus');
const { PayrollRun, Payslip, LeaveRequest, LeaveBalance, JobPosting, Applicant, Evaluation } = require('../models/HR');
const { Notification } = require('../models/Communication');
const User = require('../models/User');

const HR_ROLES = ['hr_staff', 'principal', 'super_admin', 'school_owner'];
const PH_SSS = (gross) => Math.min(gross * 0.045, 900);
const PH_PHILHEALTH = (gross) => Math.min(gross * 0.025, 1500);
const PH_PAGIBIG = (gross) => Math.min(gross * 0.02, 200);
const PH_TAX = (taxable) => {
  if (taxable <= 20833) return 0;
  if (taxable <= 33333) return (taxable - 20833) * 0.20;
  if (taxable <= 66667) return 2500 + (taxable - 33333) * 0.25;
  if (taxable <= 166667) return 10833 + (taxable - 66667) * 0.30;
  if (taxable <= 666667) return 40833 + (taxable - 166667) * 0.32;
  return 200833 + (taxable - 666667) * 0.35;
};

// ---- EMPLOYEE PROFILES ----
router.get('/employees', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const { type, department, search, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId, isActive: true };
  if (type) filter.type = type;
  if (department) filter.department = department;

  let profiles = await EmployeeProfile.find(filter)
    .populate('userId', 'firstName lastName email avatar phone gender birthDate employeeId role')
    .skip((page - 1) * limit).limit(Number(limit))
    .sort({ createdAt: -1 });

  if (search) {
    const s = search.toLowerCase();
    profiles = profiles.filter(p =>
      p.userId?.firstName?.toLowerCase().includes(s) ||
      p.userId?.lastName?.toLowerCase().includes(s) ||
      p.employeeId?.toLowerCase().includes(s)
    );
  }

  const total = await EmployeeProfile.countDocuments(filter);
  res.json({ success: true, total, employees: profiles });
}));

router.get('/employees/:id', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const profile = await EmployeeProfile.findById(req.params.id)
    .populate('userId', '-password -refreshTokens -twoFactorSecret')
    .populate('subjects', 'name code units');
  if (!profile) return res.status(404).json({ success: false, message: 'Employee not found.' });
  res.json({ success: true, employee: profile });
}));

router.post('/employees', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const profile = await EmployeeProfile.create({
    ...req.body,
    schoolId: req.user.schoolId,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, employee: profile });
}));

router.put('/employees/:id', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const profile = await EmployeeProfile.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('userId', 'firstName lastName email');
  res.json({ success: true, employee: profile });
}));

// ---- PAYROLL RUNS ----
router.get('/payroll', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const { status, year, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (status) filter.status = status;
  if (year) {
    filter['period.from'] = { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) };
  }
  const total = await PayrollRun.countDocuments(filter);
  const runs = await PayrollRun.find(filter)
    .populate('createdBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
  res.json({ success: true, total, runs });
}));

router.post('/payroll', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const run = await PayrollRun.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, run });
}));

// Generate payslips for a payroll run
router.post('/payroll/:runId/generate', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const run = await PayrollRun.findById(req.params.runId);
  if (!run) return res.status(404).json({ success: false, message: 'Payroll run not found.' });

  const employees = await EmployeeProfile.find({ schoolId: req.user.schoolId, isActive: true })
    .populate('userId', 'firstName lastName email');

  let totalGross = 0, totalDeductions = 0, totalNet = 0;
  const payslips = [];

  for (const emp of employees) {
    const { basic = 0, allowances = 0 } = emp.employment?.salary || {};
    const periodicBasic = run.type === 'semi_monthly' ? basic / 2 :
                          run.type === 'monthly' ? basic : basic / 2;

    const sss = PH_SSS(periodicBasic);
    const philhealth = PH_PHILHEALTH(periodicBasic);
    const pagibig = PH_PAGIBIG(periodicBasic);
    const taxable = periodicBasic - sss - philhealth - pagibig;
    const tax = PH_TAX(taxable);

    const grossPay = periodicBasic + allowances;
    const totalDed = sss + philhealth + pagibig + tax;
    const netPay = grossPay - totalDed;

    const existing = await Payslip.findOne({ payrollRun: run._id, employee: emp.userId });
    if (!existing) {
      const slip = await Payslip.create({
        schoolId: req.user.schoolId,
        payrollRun: run._id,
        employee: emp.userId,
        employeeProfile: emp._id,
        period: run.period,
        payDate: run.payDate,
        earnings: {
          basicSalary: periodicBasic,
          allowances: { transportation: allowances },
        },
        deductions: { sss, philhealth, pagibig, withholdingTax: tax },
        grossPay, totalDeductions: totalDed, netPay,
        status: 'draft',
      });
      payslips.push(slip);
      totalGross += grossPay;
      totalDeductions += totalDed;
      totalNet += netPay;
    }
  }

  await PayrollRun.findByIdAndUpdate(run._id, {
    totalGross, totalDeductions, totalNet,
    employeeCount: payslips.length,
    status: 'processing',
  });

  res.json({ success: true, message: `Generated ${payslips.length} payslips.`, payslips });
}));

router.put('/payroll/:runId/approve', protect, authorize('principal', 'school_owner', 'super_admin'), asyncHandler(async (req, res) => {
  const run = await PayrollRun.findByIdAndUpdate(req.params.runId, {
    status: 'approved', approvedBy: req.user._id, approvedAt: new Date(),
  }, { new: true });
  await Payslip.updateMany({ payrollRun: run._id }, { status: 'approved' });
  res.json({ success: true, run });
}));

router.put('/payroll/:runId/release', protect, authorize('principal', 'school_owner', 'super_admin'), asyncHandler(async (req, res) => {
  const run = await PayrollRun.findByIdAndUpdate(req.params.runId, {
    status: 'released', releasedBy: req.user._id, releasedAt: new Date(),
  }, { new: true });

  const payslips = await Payslip.find({ payrollRun: run._id }).populate('employee', 'email firstName');
  for (const slip of payslips) {
    await Payslip.findByIdAndUpdate(slip._id, { status: 'released' });
    await Notification.create({
      schoolId: req.user.schoolId,
      recipient: slip.employee._id,
      title: 'Payslip Released',
      message: `Your payslip for ${new Date(run.payDate).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })} is now available.`,
      type: 'system',
    });
  }

  res.json({ success: true, run });
}));

// Get payslips for a run
router.get('/payroll/:runId/payslips', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const payslips = await Payslip.find({ payrollRun: req.params.runId })
    .populate('employee', 'firstName lastName employeeId email avatar')
    .populate('employeeProfile', 'department position type');
  res.json({ success: true, payslips });
}));

// My payslips (employee)
router.get('/payslips/my', protect, asyncHandler(async (req, res) => {
  const payslips = await Payslip.find({ employee: req.user._id, status: { $ne: 'draft' } })
    .populate('payrollRun', 'name period payDate type')
    .sort({ createdAt: -1 }).limit(24);
  res.json({ success: true, payslips });
}));

// ---- LEAVE MANAGEMENT ----
router.get('/leave', protect, asyncHandler(async (req, res) => {
  const { status, type, employeeId, from, to } = req.query;
  const isHR = HR_ROLES.includes(req.user.role);
  const filter = { schoolId: req.user.schoolId };
  if (!isHR) filter.employee = req.user._id;
  if (employeeId && isHR) filter.employee = employeeId;
  if (status) filter.status = status;
  if (type) filter.leaveType = type;
  if (from && to) filter.from = { $gte: new Date(from), $lte: new Date(to) };

  const requests = await LeaveRequest.find(filter)
    .populate('employee', 'firstName lastName avatar employeeId')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json({ success: true, requests });
}));

router.post('/leave', protect, asyncHandler(async (req, res) => {
  const { leaveType, from, to, reason } = req.body;
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

  const request = await LeaveRequest.create({
    ...req.body,
    schoolId: req.user.schoolId,
    employee: req.user._id,
    days,
  });

  // Notify HR
  const hrUsers = await User.find({ schoolId: req.user.schoolId, role: 'hr_staff' }).select('_id');
  for (const hr of hrUsers) {
    await Notification.create({
      schoolId: req.user.schoolId,
      recipient: hr._id,
      sender: req.user._id,
      title: 'New Leave Request',
      message: `${req.user.firstName} ${req.user.lastName} filed a ${leaveType} leave request for ${days} day(s).`,
      type: 'system',
    });
  }

  res.status(201).json({ success: true, request });
}));

router.put('/leave/:id/approve', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const request = await LeaveRequest.findByIdAndUpdate(req.params.id, {
    status: 'approved', reviewedBy: req.user._id, reviewedAt: new Date(), remarks: req.body.remarks,
  }, { new: true }).populate('employee', 'firstName email');

  // Deduct from balance
  const balance = await LeaveBalance.findOne({ employee: request.employee._id, year: new Date().getFullYear() });
  if (balance && balance[request.leaveType]) {
    balance[request.leaveType].used += request.days;
    balance[request.leaveType].remaining = balance[request.leaveType].total - balance[request.leaveType].used;
    await balance.save();
  }

  await Notification.create({
    schoolId: req.user.schoolId, recipient: request.employee._id,
    title: 'Leave Approved', message: `Your ${request.leaveType} leave request has been approved.`, type: 'system',
  });

  res.json({ success: true, request });
}));

router.put('/leave/:id/reject', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const request = await LeaveRequest.findByIdAndUpdate(req.params.id, {
    status: 'rejected', reviewedBy: req.user._id, reviewedAt: new Date(), remarks: req.body.remarks,
  }, { new: true }).populate('employee', 'firstName email');

  await Notification.create({
    schoolId: req.user.schoolId, recipient: request.employee._id,
    title: 'Leave Rejected', message: `Your ${request.leaveType} leave request was rejected. Reason: ${req.body.remarks}`, type: 'system',
  });

  res.json({ success: true, request });
}));

router.get('/leave/balance', protect, asyncHandler(async (req, res) => {
  const year = new Date().getFullYear();
  let balance = await LeaveBalance.findOne({ employee: req.user._id, year });
  if (!balance) {
    balance = await LeaveBalance.create({ schoolId: req.user.schoolId, employee: req.user._id, year });
  }
  res.json({ success: true, balance });
}));

// ---- RECRUITMENT ----
router.get('/jobs', protect, asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (status) filter.status = status;
  if (type) filter.type = type;
  const jobs = await JobPosting.find(filter).populate('createdBy', 'firstName lastName').sort({ createdAt: -1 });
  res.json({ success: true, jobs });
}));

router.post('/jobs', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const job = await JobPosting.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, job });
}));

router.put('/jobs/:id', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const job = await JobPosting.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, job });
}));

router.get('/jobs/:jobId/applicants', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const applicants = await Applicant.find({ jobPosting: req.params.jobId, schoolId: req.user.schoolId }).sort({ applicationDate: -1 });
  res.json({ success: true, applicants });
}));

router.post('/jobs/:jobId/apply', protect, asyncHandler(async (req, res) => {
  const applicant = await Applicant.create({
    ...req.body,
    jobPosting: req.params.jobId,
    schoolId: req.user.schoolId,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, applicant });
}));

router.put('/applicants/:id/stage', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const applicant = await Applicant.findByIdAndUpdate(req.params.id, {
    stage: req.body.stage, remarks: req.body.remarks,
  }, { new: true });
  res.json({ success: true, applicant });
}));

// ---- EVALUATIONS ----
router.get('/evaluations', protect, asyncHandler(async (req, res) => {
  const isHR = HR_ROLES.includes(req.user.role);
  const filter = { schoolId: req.user.schoolId };
  if (!isHR) filter.employee = req.user._id;
  const evals = await Evaluation.find(filter)
    .populate('employee', 'firstName lastName avatar')
    .populate('evaluator', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json({ success: true, evaluations: evals });
}));

router.post('/evaluations', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const evaluation = await Evaluation.create({ ...req.body, schoolId: req.user.schoolId, evaluator: req.user._id });
  res.status(201).json({ success: true, evaluation });
}));

router.put('/evaluations/:id', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const evaluation = await Evaluation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, evaluation });
}));

// HR Analytics summary
router.get('/summary', protect, authorize(...HR_ROLES), asyncHandler(async (req, res) => {
  const [totalEmployees, byType, byDepartment, pendingLeaves] = await Promise.all([
    EmployeeProfile.countDocuments({ schoolId: req.user.schoolId, isActive: true }),
    EmployeeProfile.aggregate([
      { $match: { schoolId: req.user.schoolId, isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    EmployeeProfile.aggregate([
      { $match: { schoolId: req.user.schoolId, isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]),
    LeaveRequest.countDocuments({ schoolId: req.user.schoolId, status: 'pending' }),
  ]);
  res.json({ success: true, totalEmployees, byType, byDepartment, pendingLeaves });
}));

module.exports = router;
