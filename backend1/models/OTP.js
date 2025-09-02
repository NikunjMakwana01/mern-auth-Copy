const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: [6, 'OTP must be 6 digits']
  },
  type: {
    type: String,
    enum: ['registration', 'login', 'password-reset'],
    required: [true, 'OTP type is required']
  },
  purpose: {
    type: String,
    enum: ['email-verification', 'login-verification', 'password-reset'],
    required: [true, 'OTP purpose is required']
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration time is required'],
    index: { expireAfterSeconds: 0 } // TTL index to automatically delete expired OTPs
  },
  attempts: {
    type: Number,
    default: 0,
    max: [5, 'Maximum attempts exceeded']
  },
  lastAttempt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 });

// Static method to generate OTP
otpSchema.statics.generateOTP = function(email, type, purpose) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return this.create({
    email,
    otp,
    type,
    purpose,
    expiresAt
  });
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(email, otp, type, purpose) {
  const otpDoc = await this.findOne({
    email,
    otp,
    type,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  if (!otpDoc) {
    return { isValid: false, message: 'Invalid or expired OTP' };
  }

  // Check if maximum attempts exceeded
  if (otpDoc.attempts >= 5) {
    return { isValid: false, message: 'Maximum attempts exceeded. Please request a new OTP.' };
  }

  // Mark as used
  otpDoc.isUsed = true;
  await otpDoc.save();

  return { isValid: true, message: 'OTP verified successfully' };
};

// Static method to check if OTP exists and is valid
otpSchema.statics.checkOTP = async function(email, type, purpose) {
  const otpDoc = await this.findOne({
    email,
    type,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  return otpDoc ? true : false;
};

// Static method to invalidate existing OTPs
otpSchema.statics.invalidateExistingOTPs = async function(email, type, purpose) {
  return await this.updateMany(
    {
      email,
      type,
      purpose,
      isUsed: false
    },
    {
      $set: { isUsed: true }
    }
  );
};

// Static method to increment attempts
otpSchema.statics.incrementAttempts = async function(email, type, purpose) {
  const otpDoc = await this.findOne({
    email,
    type,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  if (otpDoc) {
    otpDoc.attempts += 1;
    otpDoc.lastAttempt = new Date();
    await otpDoc.save();
  }
};

// Static method to clean expired OTPs
otpSchema.statics.cleanExpiredOTPs = async function() {
  return await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Pre-save middleware to validate OTP format
otpSchema.pre('save', function(next) {
  if (!/^\d{6}$/.test(this.otp)) {
    return next(new Error('OTP must be exactly 6 digits'));
  }
  next();
});

module.exports = mongoose.model('OTP', otpSchema);
