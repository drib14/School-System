import mongoose from 'mongoose';

const gradeSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    quarter: { type: Number, required: true, min: 1, max: 4 },
    writtenWork: { type: Number, default: 0 },
    performanceTask: { type: Number, default: 0 },
    quarterlyAssessment: { type: Number, default: 0 },
    initialGrade: { type: Number },
    finalGrade: { type: Number }, // Transmuted
    remarks: { type: String }
}, {
    timestamps: true
});

const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;
