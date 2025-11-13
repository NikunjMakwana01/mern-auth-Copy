const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTPEmail(email, otp, purpose = 'verification') {
    try {
      const subject = this.getSubject(purpose);
      const html = this.getOTPEmailTemplate(otp, purpose);
      
      const mailOptions = {
        from: `"Voting App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetOTP(email, fullName, otp) {
    try {
      const subject = 'Password Reset Code - Voting App';
      const html = this.getPasswordResetEmailTemplate(fullName, otp);
      
      const mailOptions = {
        from: `"Voting App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  getSubject(purpose) {
    const purposeText = this.getPurposeText(purpose);
    return `Your ${purposeText} Code - Voting App`;
  }

  getOTPEmailTemplate(otp, purpose) {
    const purposeText = this.getPurposeText(purpose);
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .otp-box {
            background: white;
            border: 2px solid #ff6b35;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #ff6b35;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DigiVote</h1>
          <p>Secure Digital Voting Platform</p>
        </div>
        
        <div class="content">
          <h2>Your ${purposeText} Code</h2>
          <p>Hello!</p>
          <p>You have requested a ${purposeText} code for your Voting App account. Please use the code below to complete your ${purpose}.</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p><strong>Verification Code</strong></p>
          </div>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>This code will expire in 10 minutes</li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <p>Best regards,<br>The DigiVote App Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2025 DigiVote App. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(fullName, otp) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px solid #ff6b35; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #ff6b35; letter-spacing: 5px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Reset</h1>
          <p>Voting App Security</p>
        </div>
        <div class="content">
          <h2>Hello ${fullName}!</h2>
          <p>Use the verification code below to reset your password:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p><strong>Password Reset Code</strong></p>
          </div>
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>This code will expire in 15 minutes</li>
              <li>Never share this code with anyone</li>
            </ul>
          </div>
          <p>Best regards,<br/>The Voting App Security Team</p>
        </div>
        <div class="footer">
          <p>This is an automated security message. Please do not reply to this email.</p>
          <p>&copy; 2024 Voting App. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  async sendVotingPassword(email, fullName, electionTitle, votingPassword) {
    try {
      const subject = `Your Voting Password - ${electionTitle}`;
      const html = this.getVotingPasswordEmailTemplate(fullName, electionTitle, votingPassword);
      
      const mailOptions = {
        from: `"DigiVote App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Voting password email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending voting password email:', error);
      return { success: false, error: error.message };
    }
  }

  getVotingPasswordEmailTemplate(fullName, electionTitle, votingPassword) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Voting Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .password-box { background: white; border: 2px solid #ff6b35; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .password-code { font-size: 32px; font-weight: bold; color: #ff6b35; letter-spacing: 5px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DigiVote</h1>
          <p>Your Voting Password</p>
        </div>
        <div class="content">
          <h2>Hello ${fullName}!</h2>
          <p>The election <strong>${electionTitle}</strong> has started. Please use your voting password below to cast your vote:</p>
          <div class="password-box">
            <div class="password-code">${votingPassword}</div>
            <p><strong>Your Voting Password</strong></p>
          </div>
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>Keep this password secure and confidential</li>
              <li>You will need this password to vote</li>
              <li>Do not share this password with anyone</li>
            </ul>
          </div>
          <p>Visit the voting page and use this password along with your email and election card number to cast your vote.</p>
          <p>Best regards,<br/>The DigiVote App Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2025 DigiVote App. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  getPurposeText(purpose) {
    const purposeMap = {
      'email-verification': 'Email Verification',
      'login-verification': 'Login Verification',
      'password-reset': 'Password Reset'
    };
    return purposeMap[purpose] || 'Verification';
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection successful');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  async sendAdminCredentialsEmail(email, fullName, tempPassword) {
    try {
      const mailOptions = {
        from: `"DigiVote Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Admin Access Granted - DigiVote',
        html: this.getAdminCredentialsEmailTemplate(fullName, tempPassword)
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Send admin credentials email error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendAdminAccessGrantedEmail(email, fullName) {
    try {
      const mailOptions = {
        from: `"DigiVote Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Admin Access Granted - DigiVote',
        html: this.getAdminAccessGrantedEmailTemplate(fullName, email)
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Send admin access granted email error:', error);
      return { success: false, error: error.message };
    }
  }

  getAdminAccessGrantedEmailTemplate(fullName, email) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Access Granted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DigiVote</h1>
          <p>Admin Access Granted</p>
        </div>
        <div class="content">
          <h2>Hello ${fullName}!</h2>
          <p>You have been granted admin access to the DigiVote platform.</p>
          <div class="info-box">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> Your existing account password</p>
          </div>
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>You can login to the admin portal using your existing email and password</li>
              <li>No new password is required - use the same credentials you use for your user account</li>
              <li>Keep your admin credentials secure</li>
              <li>Do not share your credentials with anyone</li>
            </ul>
          </div>
          <p>You can now access the admin portal at the admin login page using your existing credentials.</p>
          <p>Best regards,<br/>The DigiVote Admin Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2025 DigiVote App. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  getAdminCredentialsEmailTemplate(fullName, tempPassword) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Access Granted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .password-code { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 3px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DigiVote</h1>
          <p>Admin Access Granted</p>
        </div>
        <div class="content">
          <h2>Hello ${fullName}!</h2>
          <p>You have been granted admin access to the DigiVote platform. Please use the following credentials to login:</p>
          <div class="credentials-box">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong></p>
            <div class="password-code">${tempPassword}</div>
          </div>
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>Please change your password after first login</li>
              <li>Keep your admin credentials secure</li>
              <li>Do not share these credentials with anyone</li>
            </ul>
          </div>
          <p>You can now login at the admin portal using the above credentials.</p>
          <p>Best regards,<br/>The DigiVote Admin Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2025 DigiVote App. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = EmailService;
