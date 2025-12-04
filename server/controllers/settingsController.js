import asyncHandler from 'express-async-handler';
import SystemSettings from '../models/SystemSettings.js';

// @desc    Get Settings
// @route   GET /api/settings
// @access  Private
const getSettings = asyncHandler(async (req, res) => {
    let settings = await SystemSettings.findOne();
    if (!settings) {
        settings = await SystemSettings.create({});
    }
    res.json(settings);
});

// @desc    Update Settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = asyncHandler(async (req, res) => {
    let settings = await SystemSettings.findOne();
    if (!settings) {
        settings = await SystemSettings.create({});
    }

    settings.schoolName = req.body.schoolName || settings.schoolName;
    settings.currentTerm = req.body.currentTerm || settings.currentTerm;
    settings.enrollmentOpen = req.body.enrollmentOpen !== undefined ? req.body.enrollmentOpen : settings.enrollmentOpen;

    const updated = await settings.save();
    res.json(updated);
});

export { getSettings, updateSettings };
