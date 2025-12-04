import mongoose from 'mongoose';

const departmentSchema = mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String }
}, {
    timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
