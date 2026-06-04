const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  employeeId: { type: String, unique: true, sparse: true },
  studentId: { type: String, unique: true, sparse: true },
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  suffix: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: {
    type: String,
    enum: ['super_admin','school_owner','principal','registrar','teacher','student','parent','cashier','accountant','librarian','nurse','guidance_counselor','hr_staff','employee','alumni'],
    required: true,
  },
  avatar: { type: String, default: null },
  avatarPublicId: { type: String },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    province: String,
    zipCode: String,
    country: { type: String, default: 'Philippines' },
  },
  gender: { type: String, enum: ['Male','Female','Other'] },
  birthDate: { type: Date },
  bloodType: { type: String },
  nationality: { type: String, default: 'Filipino' },
  religion: { type: String },
  civilStatus: { type: String, enum: ['Single','Married','Widowed','Separated'] },

  // Auth
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshTokens: [{ token: String, device: String, createdAt: { type: Date, default: Date.now } }],
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  // 2FA
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  twoFactorTempSecret: String,
  twoFactorEmailCode: String,
  twoFactorEmailExpires: Date,

  // Parent link
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  parentOf: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Notifications prefs
  notificationPrefs: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

userSchema.virtual('fullName').get(function () {
  return [this.firstName, this.middleName, this.lastName, this.suffix].filter(Boolean).join(' ');
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.set('toJSON', { virtuals: true, transform: (_, ret) => { delete ret.password; return ret; } });

userSchema.index({ schoolId: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
