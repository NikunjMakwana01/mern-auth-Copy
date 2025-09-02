const JWTUtils = require('../utils/jwtUtils');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = JWTUtils.verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token'
    });
  }
};

// Middleware to require email verification
const requireVerification = async (req, res, next) => {
  try {
    if (!req.user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required. Please verify your email first.'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Verification check failed'
    });
  }
};



// Middleware to require complete profile
const requireCompleteProfile = async (req, res, next) => {
  try {
    if (!req.user.profileCompleted) {
      return res.status(403).json({
        success: false,
        message: 'Profile completion required. Please complete your profile first.'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Profile check failed'
    });
  }
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = JWTUtils.verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without authentication
        console.log('Optional auth failed:', error.message);
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Middleware to check if user is locked
const checkAccountLock = async (req, res, next) => {
  try {
    if (req.user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Account lock check failed'
    });
  }
};

module.exports = {
  authenticateToken,
  requireVerification,
  requireCompleteProfile,
  optionalAuth,
  checkAccountLock
};
