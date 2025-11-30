import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Student', 'Teacher', 'Admin'], default: 'Student' },
    studentId: { type: String }, // For students
    teacherId: { type: String }, // For teachers
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    profilePicture: { type: String },
    qrCodeUrl: { type: String },
    // Profile details
    address: { type: String },
    phone: { type: String },
    department: { type: String },
    // Academic details for Student
    yearLevel: { type: String },
    section: { type: String },
    course: { type: String },
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
