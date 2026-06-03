const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  code: { type: String },
  category: { type: String, enum: ['tuition','miscellaneous','laboratory','library','registration','graduation','other'], required: true },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['per_unit','per_semester','per_year','one_time','per_subject'] },
  applicableTo: { type: String, enum: ['all','k12','college','new','returning'] },
  program: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
  yearLevel: [Number],
  gradeLevel: [String],
  semester: [String],
  academicYear: String,
  isActive: { type: Boolean, default: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const assessmentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
  academicYear: { type: String, required: true },
  semester: { type: String, enum: ['1st','2nd','Summer'] },
  
  fees: [{
    fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee' },
    feeName: String,
    category: String,
    amount: Number,
    units: Number,
    isPaid: { type: Boolean, default: false },
    paidAmount: { type: Number, default: 0 },
  }],
  
  totalAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  scholarship: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['pending','partial','paid','overdue'], default: 'pending' },
  
  assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
  referenceNumber: { type: String, unique: true },
  orNumber: { type: String },
  
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash','bank_transfer','gcash','maya','credit_card','check','paymongo'], required: true },
  status: { type: String, enum: ['pending','processing','completed','failed','refunded'], default: 'pending' },
  
  paymongoPaymentId: String,
  paymongoSourceId: String,
  paymongoCheckoutUrl: String,
  
  fees: [{ fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee' }, feeName: String, amount: Number }],
  
  receiptUrl: String,
  notes: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: Date,
  
  refundedAmount: { type: Number, default: 0 },
  refundReason: String,
  refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refundedAt: Date,
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

paymentSchema.pre('save', async function (next) {
  if (!this.referenceNumber) {
    const count = await this.constructor.countDocuments({ schoolId: this.schoolId });
    const year = new Date().getFullYear().toString().slice(-2);
    this.referenceNumber = `PAY-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Fee = mongoose.model('Fee', feeSchema);
const Assessment = mongoose.model('Assessment', assessmentSchema);
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Fee, Assessment, Payment };
