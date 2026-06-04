const nodemailer = require('nodemailer');

// Set up transporter (it will not throw immediately even if auth is missing, but will fail on sendMail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
});

const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"ISCP School System" <${process.env.EMAIL_USER || 'no-reply@iscp.edu.ph'}>`,
    to,
    subject,
    html,
  };

  try {
    // If no real credentials are provided, we mock the sending to prevent crashes
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      return true;
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    // Don't throw, just return false so the caller doesn't crash the server
    return false;
  }
};

const baseEmailTemplate = (title, content, actionBtn = '') => `
<div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
      <div style="display: inline-block; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 50%; margin-bottom: 15px;">
        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">ISCP</div>
      </div>
      <h1 style="color: #f8fafc; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">ISCP Portal</h1>
      <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px; font-weight: 500;">International State Colleges of the Philippines</p>
    </div>
    
    <!-- Body -->
    <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 16px 16px 0 0; margin-top: -10px;">
      <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 24px;">${title}</h2>
      <div style="color: #475569; font-size: 15px; line-height: 1.7;">
        ${content}
      </div>
      ${actionBtn ? `
      <div style="margin-top: 35px; text-align: center;">
        ${actionBtn}
      </div>` : ''}
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">
        This is an automated message from the ISCP School System.<br/>
        Please do not reply directly to this email.
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0;">
        &copy; ${new Date().getFullYear()} ISCP. All rights reserved.
      </p>
    </div>
  </div>
</div>
`;

const buttonStyle = "display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(59,130,246,0.3);";

const emailTemplates = {
  welcome: (name) => baseEmailTemplate(
    `Welcome to ISCP, ${name}!`,
    `<p style="margin-bottom: 16px;">Your account has been successfully created in the ISCP School System portal. We are thrilled to have you join our academic community.</p>
     <p>You can now log in to access your personal dashboard, view announcements, and manage your academic profile.</p>`,
    `<a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="${buttonStyle}">Login to Portal</a>`
  ),
  
  passwordReset: (resetUrl) => baseEmailTemplate(
    `Password Reset Request`,
    `<p style="margin-bottom: 16px;">We received a request to reset your password for your ISCP account.</p>
     <p>Click the button below to set a new password. For security reasons, this link will expire in <strong>1 hour</strong>.</p>
     <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">If you did not request a password reset, you can safely ignore this email. Your account remains secure.</p>`,
    `<a href="${resetUrl}" style="${buttonStyle.replace('#3b82f6', '#ef4444').replace('#1d4ed8', '#dc2626').replace('rgba(59,130,246,0.3)', 'rgba(239,68,68,0.3)')}">Reset Password</a>`
  ),

  studentCredentials: (name, studentId, password) => baseEmailTemplate(
    `Application Approved!`,
    `<p style="margin-bottom: 16px;">Congratulations, <strong>${name}</strong>!</p>
     <p style="margin-bottom: 24px;">Your enrollment application has been officially approved. Welcome to International State Colleges of the Philippines.</p>
     
     <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
       <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Your Portal Credentials</h3>
       <p style="margin: 0 0 12px 0;"><strong>Student ID:</strong> <span style="color: #0f172a;">${studentId}</span></p>
       <p style="margin: 0;"><strong>Password:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 4px 8px; border-radius: 4px; color: #0f172a;">${password}</span></p>
     </div>
     
     <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin-bottom: 0;">⚠️ We highly recommend logging in and changing your password immediately.</p>`,
    `<a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login/student" style="${buttonStyle.replace('#3b82f6', '#10b981').replace('#1d4ed8', '#059669').replace('rgba(59,130,246,0.3)', 'rgba(16,185,129,0.3)')}">Access Student Portal</a>`
  ),

  gradeRelease: (studentName, subject, grade) => baseEmailTemplate(
    `Grade Released: ${subject}`,
    `<p style="margin-bottom: 16px;">Dear <strong>${studentName}</strong>,</p>
     <p style="margin-bottom: 24px;">Your final grade for <strong>${subject}</strong> has been officially released and posted to your academic record.</p>
     
     <div style="text-align: center; margin: 30px 0;">
       <div style="display: inline-block; padding: 15px 40px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
         <span style="display: block; font-size: 13px; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Final Grade</span>
         <span style="font-size: 32px; font-weight: 800; color: #15803d;">${grade}</span>
       </div>
     </div>`,
    `<a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/grades" style="${buttonStyle}">View Full Grades</a>`
  ),

  paymentReceipt: (name, amount, reference, description = 'Tuition Fee Payment') => baseEmailTemplate(
    `Payment Receipt`,
    `<p style="margin-bottom: 16px;">Dear <strong>${name}</strong>,</p>
     <p style="margin-bottom: 24px;">We have successfully received your payment. Thank you for settling your account.</p>
     
     <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
       <tr>
         <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Amount Paid</td>
         <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: 700; font-size: 16px;">₱${parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
       </tr>
       <tr>
         <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Description</td>
         <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: 500; font-size: 14px;">${description}</td>
       </tr>
       <tr>
         <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Reference No.</td>
         <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-family: monospace; font-size: 14px;">${reference}</td>
       </tr>
       <tr>
         <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Date</td>
         <td style="padding: 12px 0; text-align: right; color: #0f172a; font-weight: 500; font-size: 14px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
       </tr>
     </table>
     
     <p style="font-size: 14px; color: #475569; margin: 0;">This serves as your official electronic receipt. You may view your updated statement of account in the financial portal.</p>`,
    `<a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/financial" style="${buttonStyle}">View Financial Statement</a>`
  ),
  
  billingInvoice: (name, amount, dueDate, description = 'Statement of Account') => baseEmailTemplate(
    `Billing Notice`,
    `<p style="margin-bottom: 16px;">Dear <strong>${name}</strong>,</p>
     <p style="margin-bottom: 24px;">This is a friendly reminder regarding your upcoming payment for <strong>${description}</strong>.</p>
     
     <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
       <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
         <span style="color: #92400e; font-size: 14px;">Amount Due:</span>
         <span style="color: #92400e; font-size: 18px; font-weight: 700;">₱${parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
       </div>
       <div style="display: flex; justify-content: space-between;">
         <span style="color: #92400e; font-size: 14px;">Due Date:</span>
         <span style="color: #92400e; font-size: 15px; font-weight: 600;">${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
       </div>
     </div>
     
     <p style="font-size: 14px; color: #475569; margin: 0;">Please ensure payment is made on or before the due date to avoid late penalty charges. You may pay online through the ISCP portal or over the counter at the cashier's office.</p>`,
    `<a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/financial/pay" style="${buttonStyle}">Pay Now</a>`
  ),

  twoFactor: (code) => baseEmailTemplate(
    `Security Verification`,
    `<p style="margin-bottom: 16px; text-align: center;">We noticed a login attempt from a new device or location. Please use the verification code below to securely access your account.</p>
     
     <div style="text-align: center; margin: 30px 0;">
       <div style="display: inline-block; letter-spacing: 8px; font-size: 36px; font-weight: 800; color: #1e293b; background: #f1f5f9; padding: 20px 40px; border-radius: 12px; border: 1px solid #e2e8f0;">
         ${code}
       </div>
     </div>
     
     <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone, including ISCP staff.</p>`,
    ''
  ),
};

module.exports = { sendMail, emailTemplates };
