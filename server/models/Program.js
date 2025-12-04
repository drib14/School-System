import mongoose from 'mongoose';

const programSchema = mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    description: { type: String }
}, {
    timestamps: true
});

const Program = mongoose.model('Program', programSchema);
export default Program;
