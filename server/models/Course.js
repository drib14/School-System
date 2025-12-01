import mongoose from 'mongoose';

const courseSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    schedule: {
        type: String
    }, // e.g., "Mon/Wed 10:00-11:30"
    room: {
        type: String
    },
    program: {
        type: String
    }, // e.g., "BS Computer Science"
    yearLevel: {
        type: String
    }, // e.g., "1st Year"
    section: {
        type: String
    }, // e.g., "A", "B", "1"
    credits: {
        type: Number,
        default: 3
    }
}, {
    timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
