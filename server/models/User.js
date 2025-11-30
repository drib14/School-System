import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Student', 'Teacher', 'Admin', 'Parent'], default: 'Student' },

    // Legacy/DB compatibility field
    idNumber: { type: String, unique: true, sparse: true },

    studentId: { type: String }, // For students
    teacherId: { type: String }, // For teachers
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    profilePicture: { type: String },
    qrCodeUrl: { type: String },

    // Parent Relationship
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

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

userSchema.pre('save', async function () {
    // Generate idNumber if missing
    if (!this.idNumber) {
        this.idNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    }

    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
