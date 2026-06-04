const fs = require('fs');
const file = 'backend/controllers/authController.js';
let content = fs.readFileSync(file, 'utf8');

const oldLoginStart = `const login = asyncHandler(async (req, res) => {
  const { email, password, twoFactorCode } = req.body;

  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required.' });

  const user = await User.findOne({ email }).select('+password +twoFactorSecret +refreshTokens +loginAttempts +lockUntil');`;

const newLoginStart = `const login = asyncHandler(async (req, res) => {
  const { email, password, twoFactorCode } = req.body;

  if (!email || !password) return res.status(400).json({ success: false, message: 'Email/ID and password required.' });

  const user = await User.findOne({
    $or: [{ email }, { studentId: email }, { employeeId: email }, { systemId: email }]
  }).select('+password +twoFactorSecret +refreshTokens +loginAttempts +lockUntil');`;

if (content.includes(oldLoginStart)) {
  content = content.replace(oldLoginStart, newLoginStart);
  fs.writeFileSync(file, content);
  console.log("Patched login successfully!");
} else {
  console.log("Could not find the exact string to replace in login");
}
