import mongoose from 'mongoose';

const enrollmentSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    program: { type: String, required: true },
    yearLevel: { type: String, required: true },
    section: { type: String },
    paymentMethod: { type: String },
    status: { type: String, enum: ['Pending Approval', 'Active', 'Rejected', 'Graduated', 'Dropped'], default: 'Pending Approval' },
    dateEnrolled: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
