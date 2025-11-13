const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long'],
    maxlength: [50, 'Full name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        const monthDiff = today.getMonth() - value.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < value.getDate())) {
          return age - 1 >= 18;
        }
        return age >= 18;
      },
      message: 'User must be at least 18 years old'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  currentAddress: {
    type: String,
    trim: true,
    maxlength: [200, 'Current address cannot exceed 200 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  district: {
    type: String,
    trim: true,
    maxlength: [50, 'District cannot exceed 50 characters']
  },
  taluka: {
    type: String,
    trim: true,
    maxlength: [50, 'Taluka cannot exceed 50 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  voterId: {
    type: String,
    trim: true,
    match: [/^[A-Z]{3}\d{7}$/, 'Voter ID must be 3 uppercase letters followed by 7 digits (e.g., NNI1234567)']
  },
  photo: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailOTP: {
    code: String,
    expiresAt: Date
  },
  passwordResetOTP: {
    code: String,
    expiresAt: Date
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  isAddressLocked: {
    type: Boolean,
    default: false
  },
  // Voting passwords for each election (sent when election starts)
  votingPasswords: [{
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true
    },
    password: {
      type: String,
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });
userSchema.index({ isActive: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to lock account
userSchema.methods.lockAccount = function() {
  this.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  this.loginAttempts = 0;
};

// Method to unlock account
userSchema.methods.unlockAccount = function() {
  this.lockUntil = undefined;
  this.loginAttempts = 0;
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.unlockAccount();
  }
  
  this.loginAttempts += 1;
  
  if (this.loginAttempts >= 5 && !this.isLocked) {
    this.lockAccount();
  }
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
};

// Method to generate email OTP
userSchema.methods.generateEmailOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailOTP = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
  return otp;
};

// Method to verify email OTP
userSchema.methods.verifyEmailOTP = function(otp) {
  if (!this.emailOTP || !this.emailOTP.code) {
    return false;
  }
  
  if (this.emailOTP.expiresAt < new Date()) {
    this.emailOTP = undefined;
    return false;
  }
  
  if (this.emailOTP.code === otp) {
    this.isEmailVerified = true;
    this.emailOTP = undefined;
    return true;
  }
  
  return false;
};

// Method to check if email OTP is expired
userSchema.methods.isEmailOTPExpired = function() {
  return !this.emailOTP || this.emailOTP.expiresAt < new Date();
};

// Method to generate password reset OTP
userSchema.methods.generatePasswordResetOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetOTP = {
    code: otp,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  };
  return otp;
};

// Method to verify password reset OTP
userSchema.methods.verifyPasswordResetOTP = function(otp) {
  if (!this.passwordResetOTP || !this.passwordResetOTP.code) {
    return false;
  }
  
  if (this.passwordResetOTP.expiresAt < new Date()) {
    this.passwordResetOTP = undefined;
    return false;
  }
  
  if (this.passwordResetOTP.code === otp) {
    this.passwordResetOTP = undefined;
    return true;
  }
  
  return false;
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailOTP;
  // passwordResetOTP already removed
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
