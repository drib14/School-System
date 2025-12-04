import mongoose from 'mongoose';

const sectionSchema = mongoose.Schema({
    name: { type: String, required: true }, // e.g. "A", "Block 1"
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    yearLevel: { type: String, required: true }, // "1st Year", "Grade 7"
    capacity: { type: Number, required: true, default: 40 },
    enrolledCount: { type: Number, required: true, default: 0 }
}, {
    timestamps: true
});

const Section = mongoose.model('Section', sectionSchema);
export default Section;
