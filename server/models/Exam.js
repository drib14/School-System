import mongoose from 'mongoose';

const questionSchema = mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String }], // Array of strings for choices
    correctAnswer: { type: Number, required: true }, // Index of correct option
    points: { type: Number, default: 1 }
});

const examSchema = mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [questionSchema],
    duration: { type: Number, required: true }, // Minutes
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
