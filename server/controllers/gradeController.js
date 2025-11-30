import asyncHandler from 'express-async-handler';
import Grade from '../models/Grade.js';

// K-12 Transmutation Table (Simplified for demonstration)
const transmute = (initial) => {
    if (initial >= 100) return 100;
    if (initial >= 98.40) return 99;
    if (initial >= 96.80) return 98;
    if (initial >= 95.20) return 97;
    if (initial >= 93.60) return 96;
    if (initial >= 92.00) return 95;
    if (initial >= 90.40) return 94;
    if (initial >= 88.80) return 93;
    if (initial >= 87.20) return 92;
    if (initial >= 85.60) return 91;
    if (initial >= 84.00) return 90;
    if (initial >= 82.40) return 89;
    if (initial >= 80.80) return 88;
    if (initial >= 79.20) return 87;
    if (initial >= 77.60) return 86;
    if (initial >= 76.00) return 85;
    if (initial >= 74.40) return 84;
    if (initial >= 72.80) return 83;
    if (initial >= 71.20) return 82;
    if (initial >= 69.60) return 81;
    if (initial >= 68.00) return 80;
    if (initial >= 66.40) return 79;
    if (initial >= 64.80) return 78;
    if (initial >= 63.20) return 77;
    if (initial >= 61.60) return 76;
    if (initial >= 60.00) return 75;
    return Math.floor(initial); // Failing
};

// @desc    Add/Update Grade
// @route   POST /api/grades
// @access  Private (Teacher)
const addGrade = asyncHandler(async (req, res) => {
    const { studentId, subject, quarter, ww, pt, qa } = req.body;
    // ww: Written Work Score (e.g. 85)
    // pt: Performance Task Score (e.g. 90)
    // qa: Quarterly Assessment Score (e.g. 88)

    // Weights (DepEd Standard for Core Subjects example: WW 25%, PT 50%, QA 25%)
    // This can be dynamic based on subject/track
    const W_WW = 0.25;
    const W_PT = 0.50;
    const W_QA = 0.25;

    const initialGrade = (ww * W_WW) + (pt * W_PT) + (qa * W_QA);
    const finalGrade = transmute(initialGrade);

    let grade = await Grade.findOne({ student: studentId, subject, quarter });

    if (grade) {
        grade.writtenWork = ww;
        grade.performanceTask = pt;
        grade.quarterlyAssessment = qa;
        grade.initialGrade = initialGrade;
        grade.finalGrade = finalGrade;
        await grade.save();
    } else {
        grade = await Grade.create({
            student: studentId,
            subject,
            quarter,
            writtenWork: ww,
            performanceTask: pt,
            quarterlyAssessment: qa,
            initialGrade,
            finalGrade
        });
    }

    res.status(201).json(grade);
});

// @desc    Get Grades
// @route   GET /api/grades
// @access  Private
const getGrades = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === 'Student') {
        query.student = req.user._id;
    } else if (req.query.studentId) {
        query.student = req.query.studentId;
    }

    const grades = await Grade.find(query).populate('student', 'name');
    res.json(grades);
});

export { addGrade, getGrades };
