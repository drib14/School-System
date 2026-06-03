const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['grade','payment','attendance','announcement','enrollment','schedule','message','system','alert','reminder'],
    default: 'system',
  },
  priority: { type: String, enum: ['low','normal','high','urgent'], default: 'normal' },
  channels: [{ type: String, enum: ['in_app','email','sms','push'] }],
  link: { type: String }, // deep link
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isSeen: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const announcementSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['school','department','class','emergency'], default: 'school' },
  audience: [{ type: String, enum: ['all','students','teachers','parents','staff','admin'] }],
  targetPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
  targetSections: [String],
  priority: { type: String, enum: ['normal','important','urgent'], default: 'normal' },
  attachments: [{ url: String, name: String, type: String }],
  scheduledAt: Date,
  expiresAt: Date,
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  views: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  conversationId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  content: { type: String },
  attachments: [{ url: String, name: String, type: String, size: Number }],
  messageType: { type: String, enum: ['text','image','file','system'], default: 'text' },
  isRead: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: Date }],
  isDeleted: { type: Boolean, default: false },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  conversationId: { type: String, required: true, unique: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  type: { type: String, enum: ['direct','group','class'], default: 'direct' },
  name: String, // for group chats
  avatar: String,
  lastMessage: { content: String, sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, sentAt: Date },
  unreadCount: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, count: { type: Number, default: 0 } }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Notification, Announcement, Message, Conversation };
