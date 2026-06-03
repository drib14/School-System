const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { Notification, Announcement, Message, Conversation } = require('../models/Communication');
const { v4: uuidv4 } = require('uuid');

// ---- NOTIFICATIONS ----
router.get('/notifications', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const filter = { recipient: req.user._id };
  if (isRead !== undefined) filter.isRead = isRead === 'true';

  const [total, unreadCount, notifications] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))
      .populate('sender', 'firstName lastName avatar'),
  ]);

  res.json({ success: true, total, unreadCount, notifications });
}));

router.put('/notifications/:id/read', protect, asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
  res.json({ success: true });
}));

router.put('/notifications/read-all', protect, asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  res.json({ success: true, message: 'All notifications marked as read.' });
}));

// ---- ANNOUNCEMENTS ----
router.get('/announcements', protect, asyncHandler(async (req, res) => {
  const filter = { schoolId: req.user.schoolId, isPublished: true };
  const userRole = req.user.role;
  filter.$or = [
    { audience: 'all' },
    { audience: userRole === 'teacher' ? 'teachers' : userRole === 'student' ? 'students' : userRole === 'parent' ? 'parents' : 'staff' },
  ];

  const announcements = await Announcement.find(filter)
    .populate('createdBy', 'firstName lastName role avatar')
    .sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, announcements });
}));

router.post('/announcements', protect, authorize('principal','registrar','teacher','super_admin','school_owner'), asyncHandler(async (req, res) => {
  const ann = await Announcement.create({
    ...req.body, schoolId: req.user.schoolId, createdBy: req.user._id,
    isPublished: req.body.isPublished !== false,
    publishedAt: req.body.isPublished !== false ? new Date() : undefined,
  });

  // Create notifications for audience
  if (ann.isPublished) {
    const User = require('../models/User');
    const audienceFilter = { schoolId: req.user.schoolId, isActive: true };
    if (!ann.audience.includes('all')) {
      const roleMap = { students: 'student', teachers: 'teacher', parents: 'parent', staff: { $nin: ['student','teacher','parent'] } };
      audienceFilter.role = roleMap[ann.audience[0]] || 'student';
    }
    const users = await User.find(audienceFilter).select('_id').limit(500);
    const notifs = users.map(u => ({
      schoolId: req.user.schoolId, recipient: u._id, sender: req.user._id,
      title: ann.title, message: ann.content.substring(0, 150) + '...',
      type: 'announcement', link: `/announcements/${ann._id}`,
    }));
    await Notification.insertMany(notifs);
  }

  res.status(201).json({ success: true, announcement: ann });
}));

router.put('/announcements/:id', protect, asyncHandler(async (req, res) => {
  const ann = await Announcement.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
  res.json({ success: true, announcement: ann });
}));

router.delete('/announcements/:id', protect, authorize('principal','super_admin'), asyncHandler(async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Announcement deleted.' });
}));

// ---- MESSAGES ----
router.get('/conversations', protect, asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'firstName lastName avatar role')
    .sort({ updatedAt: -1 }).limit(50);
  res.json({ success: true, conversations });
}));

router.post('/conversations', protect, asyncHandler(async (req, res) => {
  const { participantIds, type = 'direct', name } = req.body;
  const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];

  // Check for existing direct conversation
  if (type === 'direct' && allParticipants.length === 2) {
    const existing = await Conversation.findOne({
      participants: { $all: allParticipants, $size: 2 }, type: 'direct',
    });
    if (existing) return res.json({ success: true, conversation: existing });
  }

  const conversation = await Conversation.create({
    conversationId: uuidv4(), participants: allParticipants, type, name: name || null,
    schoolId: req.user.schoolId, createdBy: req.user._id,
  });

  res.status(201).json({ success: true, conversation });
}));

router.get('/conversations/:conversationId/messages', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const messages = await Message.find({ conversationId: req.params.conversationId })
    .populate('sender', 'firstName lastName avatar role')
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, messages: messages.reverse() });
}));

router.post('/conversations/:conversationId/messages', protect, asyncHandler(async (req, res) => {
  const { content, attachments, messageType, replyTo } = req.body;
  const msg = await Message.create({
    schoolId: req.user.schoolId, conversationId: req.params.conversationId,
    sender: req.user._id, content, attachments, messageType, replyTo,
  });

  await Conversation.findOneAndUpdate(
    { conversationId: req.params.conversationId },
    { lastMessage: { content: content?.substring(0, 100), sender: req.user._id, sentAt: new Date() }, updatedAt: new Date() }
  );

  // Emit via socket (handled in server.js)
  const io = req.app.get('io');
  if (io) io.to(req.params.conversationId).emit('new-message', { ...msg.toObject(), sender: req.user });

  res.status(201).json({ success: true, message: msg });
}));

module.exports = router;
