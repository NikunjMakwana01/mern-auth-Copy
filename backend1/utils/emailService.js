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
}

module.exports = EmailService;
