import asyncHandler from 'express-async-handler';
import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';

// @desc    Create Exam
// @route   POST /api/exams
// @access  Private (Teacher)
const createExam = asyncHandler(async (req, res) => {
    const { courseId, title, description, questions, duration, startDate, endDate } = req.body;

    const exam = await Exam.create({
        course: courseId,
        teacher: req.user._id,
        title,
        description,
        questions,
        duration,
        startDate,
        endDate
    });
    res.status(201).json(exam);
});

// @desc    Get Exams
// @route   GET /api/exams
// @access  Private
const getExams = asyncHandler(async (req, res) => {
    const { courseId } = req.query;
    let query = {};

    if (req.user.role === 'Teacher') {
        query.teacher = req.user._id;
    } else if (req.user.role === 'Student') {
        // If student, they should provide courseId to see exams for that course,
        // OR we can fetch all exams for their enrolled courses (complex query).
        // For simplicity, we expect courseId query param or show nothing if not provided?
        // Or we can just list ALL active exams? No, scoped to course.
        if (courseId) {
            query.course = courseId;
            query.isActive = true;
        } else {
             // Return empty if no course specified for student (or implement "My Exams" later)
             // But let's allow fetching all if just testing
        }
    }

    if (courseId) query.course = courseId;

    const exams = await Exam.find(query).populate('course', 'code name section');
    res.json(exams);
});

// @desc    Submit Exam
// @route   POST /api/exams/:id/submit
// @access  Private (Student)
const submitExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }

    const { answers } = req.body;
    let score = 0;
    let totalPoints = 0;

    exam.questions.forEach((q, index) => {
        totalPoints += q.points;
        const studentAnswer = answers.find(a => a.questionIndex === index);
        if (studentAnswer && studentAnswer.selectedOption === q.correctAnswer) {
            score += q.points;
        }
    });

    const result = await ExamResult.create({
        exam: exam._id,
        student: req.user._id,
        answers,
        score,
        totalPoints
    });

    res.status(201).json(result);
});

// @desc    Get Exam Results (For a specific exam)
// @route   GET /api/exams/:id/results
// @access  Private
const getExamResults = asyncHandler(async (req, res) => {
    let query = { exam: req.params.id };
    if (req.user.role === 'Student') {
        query.student = req.user._id;
    }
    const results = await ExamResult.find(query).populate('student', 'name email');
    res.json(results);
});

export { createExam, getExams, submitExam, getExamResults };
