const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const EmailService = require('../utils/emailService');
const JWTUtils = require('../utils/jwtUtils');
const { authenticateToken, requireVerification, checkAccountLock } = require('../middleware/auth');

const router = express.Router();
const emailService = new EmailService();

// Generate registration OTP
router.post('/generate-registration-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('mobile')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please enter a valid date of birth'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, fullName, mobile, dateOfBirth, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { mobile }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Mobile number already registered'
      });
    }

    // Check age requirement
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      if (age - 1 < 18) {
        return res.status(400).json({
          success: false,
          message: 'User must be at least 18 years old'
        });
      }
    } else if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'User must be at least 18 years old'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Invalidate existing OTPs
    await OTP.invalidateExistingOTPs(email, 'registration', 'email-verification');
    
    // Create new OTP
    await OTP.create({
      email,
      otp,
      type: 'registration',
      purpose: 'email-verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, 'email-verification');
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email successfully',
      data: {
        email,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('Generate registration OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify registration and create user
router.post('/verify-registration', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('fullName').trim().isLength({ min: 2, max: 50 }),
  body('mobile').matches(/^[6-9]\d{9}$/),
  body('dateOfBirth').isISO8601(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp, fullName, mobile, dateOfBirth, password } = req.body;

    // Verify OTP
    const otpResult = await OTP.verifyOTP(email, otp, 'registration', 'email-verification');
    
    if (!otpResult.isValid) {
      return res.status(400).json({
        success: false,
        message: otpResult.message
      });
    }

    // Create user
    const user = new User({
      fullName,
      email,
      mobile,
      dateOfBirth,
      password,
      isEmailVerified: true,
      profileCompleted: true
    });

    await user.save();

    // Generate JWT token
    const token = JWTUtils.generateToken({ userId: user._id });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Voting App.',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error('Registration verification error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or mobile number'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      user.incLoginAttempts();
      await user.save();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    user.resetLoginAttempts();
    await user.save();

    // Generate login OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Invalidate existing OTPs
    await OTP.invalidateExistingOTPs(email, 'login', 'login-verification');
    
    // Create new OTP
    await OTP.create({
      email,
      otp,
      type: 'login',
      purpose: 'login-verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, 'login-verification');
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email for login verification',
      data: {
        email,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify login OTP
router.post('/verify-login', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;

    // Verify OTP
    const otpResult = await OTP.verifyOTP(email, otp, 'login', 'login-verification');
    
    if (!otpResult.isValid) {
      return res.status(400).json({
        success: false,
        message: otpResult.message
      });
    }

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate JWT token
    const token = JWTUtils.generateToken({ userId: user._id });

    res.json({
      success: true,
      message: 'Login successful! Welcome back.',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error('Login verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Generate password reset OTP
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Generate password reset OTP
    const otp = user.generatePasswordResetOTP();
    await user.save();

    // Send password reset OTP email
    try {
      await emailService.sendPasswordResetOTP(email, user.fullName, otp);
      
      res.json({
        success: true,
        message: 'Password reset OTP sent to your email address'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset OTP. Please try again.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify password reset OTP and reset password
router.post('/reset-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp, newPassword } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password reset OTP
    if (!user.verifyPasswordResetOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Resend OTP
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail(),
  body('type').isIn(['registration', 'login']),
  body('purpose').isIn(['email-verification', 'login-verification'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, type, purpose } = req.body;

    // Check if user exists (for login) or doesn't exist (for registration)
    if (type === 'login') {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } else if (type === 'registration') {
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Invalidate existing OTPs
    await OTP.invalidateExistingOTPs(email, type, purpose);
    
    // Create new OTP
    await OTP.create({
      email,
      otp,
      type,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, purpose);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        email,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can add the token to a blacklist if needed
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
