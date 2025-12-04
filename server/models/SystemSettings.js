import mongoose from 'mongoose';

const systemSettingsSchema = mongoose.Schema({
    schoolName: { type: String, default: 'EduCore University' },
    currentTerm: { type: String, default: '1st Semester' },
    enrollmentOpen: { type: Boolean, default: true },
    logoUrl: { type: String }
}, { timestamps: true });

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
export default SystemSettings;
