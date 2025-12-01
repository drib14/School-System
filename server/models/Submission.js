import mongoose from 'mongoose';

const submissionSchema = mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String // Text or URL
    },
    fileUrl: {
        type: String
    },
    grade: {
        type: Number
    },
    feedback: {
        type: String
    },
    status: {
        type: String,
        enum: ['Submitted', 'Graded', 'Late', 'Missing'],
        default: 'Submitted'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
