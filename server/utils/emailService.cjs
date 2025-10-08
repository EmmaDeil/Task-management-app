const nodemailer = require("nodemailer");

// Create email transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn("Email not configured. Emails will not be sent.");
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send invitation email
const sendInvitationEmail = async (options) => {
  const { email, inviteLink, organizationName, role, invitedBy } = options;

  const transporter = createTransporter();

  if (!transporter) {
    console.log("Email transporter not configured. Skipping email send.");
    return { sent: false, reason: "Email not configured" };
  }

  const roleText = role.charAt(0).toUpperCase() + role.slice(1);

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Org Manager" <noreply@taskflow.com>',
    to: email,
    subject: `You've been invited to join ${organizationName} on Org Manager`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .info-box { background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited!</h1>
            </div>
            <div class="content">
              <h2>Welcome to ${organizationName}</h2>
              <p>Hi there!</p>
              <p><strong>${invitedBy}</strong> has invited you to join <strong>${organizationName}</strong> on Org manager as a <strong>${roleText}</strong>.</p>
              
              <div class="info-box">
                <h3>What's Next?</h3>
                <p>Click the button below to accept your invitation and create your account. You'll be able to:</p>
                <ul>
                  <li>✅ Collaborate with your team</li>
                  <li>✅ Manage tasks and projects</li>
                  <li>✅ Track progress in real-time</li>
                  <li>✅ Stay organized and productive</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${inviteLink}" class="button">Accept Invitation & Sign Up</a>
              </div>

              <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
                Or copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color: #4F46E5;">${inviteLink}</a>
              </p>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                ⏰ This invitation expires in 7 days.<br>
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Org Manager. All rights reserved.</p>
              <p>Need help? Contact us at support@orgmanager.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
You've been invited to join ${organizationName} on Org Manager!

${invitedBy} has invited you to join ${organizationName} as a ${roleText}.

To accept your invitation and create your account, visit:
${inviteLink}

This invitation expires in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} TaskFlow
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${email}`);
    return { sent: true };
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return { sent: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (options) => {
  const { email, name, organizationName } = options;

  const transporter = createTransporter();

  if (!transporter) {
    return { sent: false, reason: "Email not configured" };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Org Manager" <noreply@orgmanager.com>',
    to: email,
    subject: `Welcome to ${organizationName} on Org Manager!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 Welcome Aboard, ${name}!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Welcome to <strong>${organizationName}</strong> on Org Manager! 🚀</p>
              <p>Your account has been created successfully. You can now log in and start collaborating with your team.</p>
              <p>If you have any questions or need help getting started, don't hesitate to reach out to your team or our support team.</p>
              <p>Happy tasking!</p>
              <p>- The Org Management Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TaskFlow. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return { sent: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { sent: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (options) => {
  const { email, resetLink, name } = options;

  const transporter = createTransporter();

  if (!transporter) {
    return { sent: false, reason: "Email not configured" };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Org Manager" <noreply@orgmanager.com>',
    to: email,
    subject: "Password Reset Request - Org Manager",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .warning { background-color: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${name || "there"},</p>
              <p>We received a request to reset your password for your Org Manager account.</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>

              <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #ef4444;">${resetLink}</a>
              </p>

              <div class="warning">
                <p><strong>⚠️ Important:</strong></p>
                <ul style="margin: 10px 0;">
                  <li>This link expires in 1 hour</li>
                  <li>For security, this link can only be used once</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
              </div>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                If you didn't request a password reset, your account is still secure and you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Org Manager. All rights reserved.</p>
              <p>Need help? Contact us at support@orgmanager.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Password Reset Request - Org Manager

Hi ${name || "there"},

We received a request to reset your password for your Org Manager account.

To reset your password, visit:
${resetLink}

This link expires in 1 hour and can only be used once.

If you didn't request a password reset, you can safely ignore this email.

© ${new Date().getFullYear()} Org Manager
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return { sent: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { sent: false, error: error.message };
  }
};

module.exports = {
  sendInvitationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
