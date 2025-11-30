import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminStats = asyncHandler(async (req, res) => {
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalTeachers = await User.countDocuments({ role: 'Teacher' });
    const totalParents = await User.countDocuments({ role: 'Parent' });

    // Recent Users
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);

    res.json({
        students: totalStudents,
        teachers: totalTeachers,
        parents: totalParents,
        recentActivity: recentUsers.map(u => ({
            text: `New ${u.role} Registration: ${u.name}`,
            time: u.createdAt
        }))
    });
});

// @desc    Get Parent Dashboard Stats
// @route   GET /api/dashboard/parent
// @access  Private (Parent)
const getParentStats = asyncHandler(async (req, res) => {
    // Find parent and populate children
    const parent = await User.findById(req.user._id).populate('children');

    if (!parent || !parent.children || parent.children.length === 0) {
        return res.json({ children: [] });
    }

    const childrenData = await Promise.all(parent.children.map(async (child) => {
        const attendance = await Attendance.find({ student: child._id }).sort({ createdAt: -1 }).limit(5);
        const grades = await Grade.find({ student: child._id });

        // Calculate GPA or Average (simplified)
        const avg = grades.length > 0
            ? grades.reduce((acc, g) => acc + (g.finalGrade || 0), 0) / grades.length
            : 0;

        return {
            id: child._id,
            name: child.name,
            attendance,
            grades,
            averageGrade: avg.toFixed(2)
        };
    }));

    res.json({ children: childrenData });
});

export { getAdminStats, getParentStats };
