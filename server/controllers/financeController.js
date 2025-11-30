import asyncHandler from 'express-async-handler';
import Finance from '../models/Finance.js';

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

export { getFinance };
