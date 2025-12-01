import asyncHandler from 'express-async-handler';
import Announcement from '../models/Announcement.js';

// @desc    Get announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    res.json(announcements);
});

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin)
const createAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.create(req.body);
    res.status(201).json(announcement);
});

export { getAnnouncements, createAnnouncement };
