import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Get users
// @route   GET /api/users
// @access  Private (Admin/Teacher)
const getUsers = asyncHandler(async (req, res) => {
    const { role } = req.query;
    let query = {};
    if (role) {
        query.role = role;
    }
    const users = await User.find(query).select('-password');
    res.json(users);
});

export { getUsers };
