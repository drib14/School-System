const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"ISCP School System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

const emailTemplates = {
  welcome: (name) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:30px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">ISCP School System</h1>
        <p style="color:#bfdbfe;margin:5px 0 0">International State Colleges of the Philippines</p>
      </div>
      <div style="padding:30px">
        <h2 style="color:#1e40af">Welcome, ${name}!</h2>
        <p style="color:#4b5563">Your account has been created successfully. You can now access the ISCP School System portal.</p>
        <a href="${process.env.CLIENT_URL}/login" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:15px">Login to Portal</a>
      </div>
    </div>`,
  
  passwordReset: (resetUrl) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:30px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">Password Reset</h1>
      </div>
      <div style="padding:30px">
        <h2 style="color:#1e40af">Reset Your Password</h2>
        <p style="color:#4b5563">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#ef4444);color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:15px">Reset Password</a>
        <p style="color:#9ca3af;font-size:12px;margin-top:20px">If you did not request a password reset, please ignore this email.</p>
      </div>
    </div>`,

  studentCredentials: (name, studentId, password) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:30px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">Application Approved!</h1>
        <p style="color:#a7f3d0;margin:5px 0 0">Welcome to ISCP</p>
      </div>
      <div style="padding:30px">
        <h2 style="color:#059669">Congratulations, ${name}!</h2>
        <p style="color:#4b5563">Your application has been approved. Below are your student portal credentials:</p>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;font-size:16px;">
          <p style="margin:0 0 10px 0;"><strong>Student ID / Email:</strong> ${studentId}</p>
          <p style="margin:0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p style="color:#ef4444;font-size:13px;font-weight:bold;">We highly recommend logging in and changing your password immediately.</p>
        <a href="${process.env.CLIENT_URL}/login/student" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:15px">Login to Student Portal</a>
      </div>
    </div>`,

  gradeRelease: (studentName, subject, grade) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:30px;text-align:center;border-radius:10px 10px 0 0">
        <h1 style="color:white;margin:0">Grades Released</h1>
      </div>
      <div style="padding:30px;background:#fff;border-radius:0 0 10px 10px">
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Your grade for <strong>${subject}</strong> has been released: <strong style="color:#1e40af;font-size:18px">${grade}</strong></p>
        <a href="${process.env.CLIENT_URL}/grades" style="display:inline-block;background:#1e40af;color:white;padding:12px 30px;border-radius:8px;text-decoration:none">View Grades</a>
      </div>
    </div>`,

  paymentReceipt: (name, amount, reference) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#059669,#10b981);padding:30px;text-align:center;border-radius:10px 10px 0 0">
        <h1 style="color:white;margin:0">Payment Received</h1>
      </div>
      <div style="padding:30px;background:#fff;border-radius:0 0 10px 10px">
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your payment of <strong>₱${amount.toLocaleString()}</strong> has been received.</p>
        <p>Reference: <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px">${reference}</code></p>
      </div>
    </div>`,

  twoFactor: (code) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:30px;text-align:center;border-radius:10px 10px 0 0">
        <h1 style="color:white;margin:0">Two-Factor Authentication</h1>
      </div>
      <div style="padding:30px;background:#fff;border-radius:0 0 10px 10px;text-align:center">
        <p style="color:#4b5563">Your verification code is:</p>
        <div style="font-size:36px;font-weight:bold;color:#1e40af;letter-spacing:8px;padding:20px;background:#eff6ff;border-radius:10px;margin:15px 0">${code}</div>
        <p style="color:#9ca3af;font-size:12px">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    </div>`,
};

module.exports = { sendMail, emailTemplates };
