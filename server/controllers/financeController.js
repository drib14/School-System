import asyncHandler from 'express-async-handler';
import Finance from '../models/Finance.js';
import User from '../models/User.js';

// @desc    Get finance records
// @route   GET /api/finance
// @access  Private
const getFinance = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === 'Student') {
        query.student = req.user._id;
    }
    const finance = await Finance.find(query).populate('student', 'name');
    res.json(finance);
});

// @desc    Create finance record (Invoice)
// @route   POST /api/finance
// @access  Private (Admin/Staff)
const createFinance = asyncHandler(async (req, res) => {
    const { studentId, title, amount, dueDate } = req.body;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const finance = await Finance.create({
        student: studentId,
        title,
        amount,
        dueDate: dueDate || new Date(),
        status: 'Pending',
        type: 'Income'
    });

    res.status(201).json(finance);
});

// @desc    Update finance record
// @route   PUT /api/finance/:id
// @access  Private (Admin)
const updateFinance = asyncHandler(async (req, res) => {
    const finance = await Finance.findById(req.params.id);
    if (!finance) {
        res.status(404);
        throw new Error('Record not found');
    }
    finance.status = req.body.status || finance.status;
    const updated = await finance.save();
    res.json(updated);
});

export { getFinance, createFinance, updateFinance };
