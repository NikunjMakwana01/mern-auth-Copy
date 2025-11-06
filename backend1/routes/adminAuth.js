const express = require('express');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const JWTUtils = require('../utils/jwtUtils');
const OTP = require('../models/OTP');
const EmailService = require('../utils/emailService');
const emailService = new EmailService();

const router = express.Router();

// Step 1: Verify credentials and send OTP to admin email
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin credentials are wrong' });
    }
    const isValid = await admin.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Admin credentials are wrong' });
    }

    // Invalidate any existing login OTPs
    await OTP.invalidateExistingOTPs(email, 'login', 'login-verification');
    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({
      email,
      otp,
      type: 'login',
      purpose: 'login-verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, 'login-verification');
    if (!emailResult.success) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
    }
    return res.json({ success: true, message: 'OTP sent to admin email', data: { email, expiresIn: '10 minutes' } });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Step 2: Verify OTP and return admin token
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { email, otp } = req.body;
    const otpResult = await OTP.verifyOTP(email, otp, 'login', 'login-verification');
    if (!otpResult.isValid) {
      return res.status(400).json({ success: false, message: otpResult.message });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    const token = JWTUtils.generateToken({ sub: 'admin', adminId: admin._id }, '3h');
    return res.json({ success: true, message: 'Admin login successful', data: { admin: admin.getPublicProfile(), token } });
  } catch (error) {
    console.error('Admin verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/me', require('../middleware/auth').authenticateAdmin, async (req, res) => {
  return res.json({ success: true, data: { admin: req.admin } });
});

module.exports = router;


