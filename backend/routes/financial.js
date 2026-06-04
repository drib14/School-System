const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { Fee, Assessment, Payment } = require('../models/Financial');
const { Notification } = require('../models/Communication');
const { sendMail, emailTemplates } = require('../config/mailer');
const User = require('../models/User');
const axios = require('axios');

const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY;
const paymongoAuth = Buffer.from(`${PAYMONGO_SECRET}:`).toString('base64');

// ---- FEES ----
router.get('/fees', protect, asyncHandler(async (req, res) => {
  const fees = await Fee.find({ schoolId: req.user.schoolId, isActive: true });
  res.json({ success: true, fees });
}));

router.post('/fees', protect, authorize('cashier','accountant','principal','super_admin'), asyncHandler(async (req, res) => {
  const fee = await Fee.create({ ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id });
  res.status(201).json({ success: true, fee });
}));

router.put('/fees/:id', protect, authorize('cashier','accountant','principal','super_admin'), asyncHandler(async (req, res) => {
  const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, fee });
}));

// ---- ASSESSMENT ----
router.get('/assessments', protect, asyncHandler(async (req, res) => {
  const { studentId, status, academicYear, semester } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (req.user.role === 'student') filter.student = req.user._id;
  if (studentId) filter.student = studentId;
  if (status) filter.status = status;
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = semester;

  const assessments = await Assessment.find(filter)
    .populate('student', 'firstName lastName studentId')
    .populate('enrollment', 'enrollmentNumber')
    .populate('fees.fee', 'name category');
  res.json({ success: true, assessments });
}));

router.post('/assessments', protect, authorize('cashier','accountant','registrar','super_admin'), asyncHandler(async (req, res) => {
  const { student, enrollment, academicYear, semester, fees: feeItems, discount = 0, scholarship = 0 } = req.body;

  let totalAmount = 0;
  const feeData = [];
  for (const f of feeItems) {
    const fee = await Fee.findById(f.feeId);
    if (fee) {
      const amount = fee.frequency === 'per_unit' ? fee.amount * (f.units || 1) : fee.amount;
      feeData.push({ fee: fee._id, feeName: fee.name, category: fee.category, amount });
      totalAmount += amount;
    }
  }

  const netAmount = totalAmount - discount - scholarship;
  const assessment = await Assessment.create({
    schoolId: req.user.schoolId, student, enrollment, academicYear, semester,
    fees: feeData, totalAmount, discount, scholarship,
    netAmount, balance: netAmount, status: 'pending',
    assessedBy: req.user._id, createdBy: req.user._id,
  });

  res.status(201).json({ success: true, assessment });
}));

// ---- PAYMENTS ----
router.get('/payments', protect, asyncHandler(async (req, res) => {
  const { studentId, status, method, startDate, endDate, page = 1, limit = 20 } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (req.user.role === 'student') filter.student = req.user._id;
  if (studentId) filter.student = studentId;
  if (status) filter.status = status;
  if (method) filter.method = method;
  if (startDate && endDate) filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .populate('student', 'firstName lastName studentId')
    .populate('assessment')
    .populate('processedBy', 'firstName lastName')
    .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });

  res.json({ success: true, total, payments });
}));

// Cash / Bank payment
router.post('/payments/cash', protect, authorize('cashier','accountant','super_admin'), asyncHandler(async (req, res) => {
  const { student, assessment: assessmentId, amount, method, notes } = req.body;

  const payment = await Payment.create({
    schoolId: req.user.schoolId, student, assessment: assessmentId,
    amount, method, status: 'completed', paidAt: new Date(),
    processedBy: req.user._id, notes, createdBy: req.user._id,
  });

  // Update assessment balance
  if (assessmentId) {
    const assessment = await Assessment.findById(assessmentId);
    if (assessment) {
      assessment.totalPaid += amount;
      assessment.balance = Math.max(0, assessment.netAmount - assessment.totalPaid);
      assessment.status = assessment.balance <= 0 ? 'paid' : 'partial';
      await assessment.save();
    }
  }

  // Notify student
  const studentUser = await User.findById(student).select('email firstName');
  await Notification.create({
    schoolId: req.user.schoolId, recipient: student,
    title: 'Payment Received', message: `Payment of ₱${amount.toLocaleString()} received. Reference: ${payment.referenceNumber}`,
    type: 'payment',
  });

  if (studentUser?.email) {
    try {
      await sendMail({ to: studentUser.email, subject: 'ISCP - Payment Receipt', html: emailTemplates.paymentReceipt(studentUser.firstName, amount, payment.referenceNumber) });
    } catch (_) {}
  }

  res.status(201).json({ success: true, payment });
}));

// PayMongo Checkout Session
router.post('/payments/paymongo-checkout', protect, asyncHandler(async (req, res) => {
  const { amount, description, student, assessmentId, gateway } = req.body;
  
  if (!amount || !gateway) {
    return res.status(400).json({ success: false, message: 'Amount and gateway are required.' });
  }

  const paymongoGateways = {
    gcash: 'gcash',
    paymaya: 'paymaya',
    grab_pay: 'grab_pay',
    card: 'card'
  };

  const selectedGateway = paymongoGateways[gateway] || 'gcash';

  try {
    const successUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/my-payments?session_id={CHECKOUT_SESSION_ID}&status=success`;
    const cancelUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/my-payments?status=cancelled`;

    const response = await axios.post('https://api.paymongo.com/v1/checkout_sessions', {
      data: {
        attributes: {
          show_description: true,
          show_line_items: true,
          cancel_url: cancelUrl,
          success_url: successUrl,
          payment_method_types: [selectedGateway],
          line_items: [
            {
              amount: Math.round(amount * 100), // in centavos
              currency: 'PHP',
              name: description || 'ISCP School Fee Payment',
              quantity: 1
            }
          ],
          description: description || 'ISCP School Fee Payment'
        }
      }
    }, {
      headers: { 
        Authorization: `Basic ${paymongoAuth}`, 
        'Content-Type': 'application/json' 
      },
    });

    const session = response.data.data;
    const checkoutUrl = session.attributes.checkout_url;

    // Create a pending payment record
    const payment = await Payment.create({
      schoolId: req.user.schoolId,
      student: student || req.user._id,
      assessment: assessmentId,
      amount,
      method: gateway, // gcash, paymaya, grab_pay, credit_card
      status: 'pending',
      paymongoPaymentId: session.id,
      paymongoCheckoutUrl: checkoutUrl,
      createdBy: req.user._id
    });

    res.json({ success: true, checkoutUrl, sessionId: session.id, payment });
  } catch (err) {
    console.error('Paymongo Checkout Session Error:', err.response?.data || err);
    res.status(500).json({ success: false, message: 'PayMongo session creation failed.', error: err.response?.data });
  }
}));

// PayMongo Verify Checkout Session Status
router.get('/payments/paymongo-verify/:sessionId', protect, asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  try {
    const response = await axios.get(`https://api.paymongo.com/v1/checkout_sessions/${sessionId}`, {
      headers: { Authorization: `Basic ${paymongoAuth}` }
    });

    const session = response.data.data;
    const paymentStatus = session.attributes.status;
    const paymentsList = session.attributes.payments || [];

    const payment = await Payment.findOne({ paymongoPaymentId: sessionId });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found for this session.' });
    }

    if (payment.status === 'completed') {
      return res.json({ success: true, status: 'completed', payment });
    }

    if (paymentStatus === 'paid') {
      payment.status = 'completed';
      payment.paidAt = new Date();
      if (paymentsList.length > 0) {
        payment.orNumber = paymentsList[0].id;
      }
      await payment.save();

      // Update assessment balance
      if (payment.assessment) {
        const assessment = await Assessment.findById(payment.assessment);
        if (assessment) {
          assessment.totalPaid += payment.amount;
          assessment.balance = Math.max(0, assessment.netAmount - assessment.totalPaid);
          assessment.status = assessment.balance <= 0 ? 'paid' : 'partial';
          await assessment.save();
        }
      }

      // Notify user
      await Notification.create({
        schoolId: payment.schoolId,
        recipient: payment.student,
        title: 'Payment Completed',
        message: `Your online payment of ₱${payment.amount.toLocaleString()} was successfully processed. Reference: ${payment.referenceNumber}`,
        type: 'payment',
      });

      return res.json({ success: true, status: 'completed', payment });
    } else {
      return res.json({ success: true, status: paymentStatus, payment });
    }
  } catch (err) {
    console.error('Paymongo Verification Error:', err.response?.data || err);
    res.status(500).json({ success: false, message: 'PayMongo verification failed.', error: err.response?.data });
  }
}));

// PayMongo webhook (support both links and checkout sessions)
router.post('/payments/webhook', asyncHandler(async (req, res) => {
  const event = req.body;
  const type = event.data?.attributes?.type;
  
  if (type === 'payment.paid' || type === 'checkout_session.paid') {
    let paymentId;
    if (type === 'payment.paid') {
      paymentId = event.data?.attributes?.data?.id;
    } else {
      paymentId = event.data?.id; // checkout session ID is on data.id
    }

    const payment = await Payment.findOne({ paymongoPaymentId: paymentId });
    if (payment && payment.status !== 'completed') {
      payment.status = 'completed';
      payment.paidAt = new Date();
      await payment.save();

      if (payment.assessment) {
        const assessment = await Assessment.findById(payment.assessment);
        if (assessment) {
          assessment.totalPaid += payment.amount;
          assessment.balance = Math.max(0, assessment.netAmount - assessment.totalPaid);
          assessment.status = assessment.balance <= 0 ? 'paid' : 'partial';
          await assessment.save();
        }
      }
    }
  }
  res.json({ received: true });
}));

router.get('/payments/my', protect, authorize('student'), asyncHandler(async (req, res) => {
  const payments = await Payment.find({ student: req.user._id }).sort({ createdAt: -1 })
    .populate('assessment', 'totalAmount netAmount');
  res.json({ success: true, payments });
}));

// Financial summary
router.get('/summary', protect, authorize('cashier','accountant','principal','super_admin','school_owner'), asyncHandler(async (req, res) => {
  const { startDate, endDate, academicYear } = req.query;
  const filter = { schoolId: req.user.schoolId, status: 'completed' };
  if (startDate && endDate) filter.paidAt = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const [totalRevenue, byMethod, dailyRevenue, pendingBalance] = await Promise.all([
    Payment.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: filter }, { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    Payment.aggregate([{ $match: filter }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } }, total: { $sum: '$amount' } } }, { $sort: { _id: 1 } }, { $limit: 30 }]),
    Assessment.aggregate([{ $match: { schoolId: req.user.schoolId } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
  ]);

  res.json({ success: true, totalRevenue: totalRevenue[0]?.total || 0, byMethod, dailyRevenue, pendingBalance: pendingBalance[0]?.total || 0 });
}));

router.get('/my-statement', protect, authorize('student'), asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ student: req.user._id })
    .populate('fees.fee', 'name category')
    .sort({ createdAt: -1 });
  const payments = await Payment.find({ student: req.user._id }).sort({ createdAt: -1 });
  
  res.json({ success: true, assessments, payments });
}));

module.exports = router;
