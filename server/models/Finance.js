import mongoose from 'mongoose';

const financeSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true }, // e.g. "Tuition Fee"
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Income', 'Expense'], default: 'Income' },
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
    dueDate: { type: Date }
}, {
    timestamps: true
});

const Finance = mongoose.model('Finance', financeSchema);
export default Finance;
