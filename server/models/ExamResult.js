import mongoose from 'mongoose';

const examResultSchema = mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{
        questionIndex: Number,
        selectedOption: Number
    }],
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const ExamResult = mongoose.model('ExamResult', examResultSchema);
export default ExamResult;
