import asyncHandler from 'express-async-handler';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

// @desc    Get assignments for a specific course
// @route   GET /api/lms/assignments?courseId=...
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
    const { courseId } = req.query;
    if (!courseId) {
        res.status(400);
        throw new Error('Course ID is required');
    }
    const assignments = await Assignment.find({ course: courseId }).sort({ dueDate: 1 });
    res.json(assignments);
});

// @desc    Create an assignment
// @route   POST /api/lms/assignments
// @access  Private (Teacher/Admin)
const createAssignment = asyncHandler(async (req, res) => {
    const { courseId, title, description, dueDate, points } = req.body;

    const assignment = await Assignment.create({
        course: courseId,
        title,
        description,
        dueDate,
        points,
        createdBy: req.user._id
    });
    res.status(201).json(assignment);
});

// @desc    Submit an assignment
// @route   POST /api/lms/submissions
// @access  Private (Student)
const submitAssignment = asyncHandler(async (req, res) => {
    const { assignmentId, content, fileUrl } = req.body;

    // Check if already submitted
    const existing = await Submission.findOne({
        assignment: assignmentId,
        student: req.user._id
    });

    if (existing) {
        existing.content = content || existing.content;
        existing.fileUrl = fileUrl || existing.fileUrl;
        existing.submittedAt = Date.now();
        const updated = await existing.save();
        return res.json(updated);
    }

    const submission = await Submission.create({
        assignment: assignmentId,
        student: req.user._id,
        content,
        fileUrl
    });
    res.status(201).json(submission);
});

// @desc    Get submissions for an assignment
// @route   GET /api/lms/submissions/:assignmentId
// @access  Private (Teacher)
const getSubmissions = asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
        .populate('student', 'name email');
    res.json(submissions);
});

// @desc    Get my submission for a specific assignment
// @route   GET /api/lms/my-submission/:assignmentId
// @access  Private (Student)
const getMySubmission = asyncHandler(async (req, res) => {
    const submission = await Submission.findOne({
        assignment: req.params.assignmentId,
        student: req.user._id
    });
    // Return null or empty object if none, don't throw error
    res.json(submission || null);
});

export {
    getAssignments,
    createAssignment,
    submitAssignment,
    getSubmissions,
    getMySubmission,
    gradeSubmission
};

// @desc    Grade a submission
// @route   PUT /api/lms/submissions/:id/grade
// @access  Private (Teacher)
const gradeSubmission = asyncHandler(async (req, res) => {
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(req.params.id);

    if (submission) {
        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'Graded';

        const updatedSubmission = await submission.save();
        res.json(updatedSubmission);
    } else {
        res.status(404);
        throw new Error('Submission not found');
    }
});
