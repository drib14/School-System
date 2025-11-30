import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    timeIn: { type: String },
    timeOut: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Present', 'Late', 'Absent', 'Excused'],
        default: 'Pending'
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Teacher who verified
    remarks: { type: String }
}, {
    timestamps: true
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
