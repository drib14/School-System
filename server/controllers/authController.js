import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import nodemailer from 'nodemailer';

// Generate random 6 digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (email, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text
        });
    } catch (error) {
        console.error('Email sending failed:', error);
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const verificationCode = generateCode();

    const user = await User.create({
        name,
        email,
        password,
        role,
        verificationCode
    });

    if (user) {
        await sendEmail(user.email, 'Verify your email', `Your verification code is: ${verificationCode}`);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: 'User registered. Please check email for verification code.'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Verify email with code
// @route   POST /api/auth/verify
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (user && user.verificationCode === code) {
        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid code or email');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
             // Resend code if not verified?
             const code = generateCode();
             user.verificationCode = code;
             await user.save();
             await sendEmail(user.email, 'Verify your email', `Your verification code is: ${code}`);

             res.status(401);
             throw new Error('Account not verified. Verification code sent to email.');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const code = generateCode();
    user.verificationCode = code;
    await user.save();

    await sendEmail(user.email, 'Reset Password', `Your password reset code is: ${code}`);

    res.json({ message: 'Reset code sent to email' });
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (user && user.verificationCode === code) {
        user.password = newPassword;
        user.verificationCode = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } else {
        res.status(400);
        throw new Error('Invalid code');
    }
});

export { registerUser, verifyEmail, authUser, forgotPassword, resetPassword };
