import asyncHandler from 'express-async-handler';
import Department from '../models/Department.js';
import Program from '../models/Program.js';
import Section from '../models/Section.js';

// --- Departments ---
const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({});
    res.json(departments);
});

const createDepartment = asyncHandler(async (req, res) => {
    const { name, code, description } = req.body;
    const dept = await Department.create({ name, code, description });
    res.status(201).json(dept);
});

// --- Programs ---
const getPrograms = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    let query = {};
    if (departmentId) query.department = departmentId;
    const programs = await Program.find(query).populate('department', 'name code');
    res.json(programs);
});

const createProgram = asyncHandler(async (req, res) => {
    const { name, code, department, description } = req.body;
    const program = await Program.create({ name, code, department, description });
    res.status(201).json(program);
});

// --- Sections ---
const getSections = asyncHandler(async (req, res) => {
    const { programId, yearLevel } = req.query;
    let query = {};
    if (programId) query.program = programId;
    if (yearLevel) query.yearLevel = yearLevel;

    const sections = await Section.find(query).populate({
        path: 'program',
        populate: { path: 'department' }
    });
    res.json(sections);
});

const createSection = asyncHandler(async (req, res) => {
    const { name, program, yearLevel, capacity } = req.body;
    const section = await Section.create({ name, program, yearLevel, capacity: capacity || 40 });
    res.status(201).json(section);
});

export {
    getDepartments, createDepartment,
    getPrograms, createProgram,
    getSections, createSection
};
