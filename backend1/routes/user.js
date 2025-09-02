const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const EmailService = require('../utils/emailService');

const router = express.Router();
const emailService = new EmailService();

// Get user profile
router.get('/profile', authenticateToken, requireVerification, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Test profile update endpoint
router.put('/profile-test', authenticateToken, async (req, res) => {
  try {
    console.log('Test profile update request:', req.body);
    
    const { fullName } = req.body;
    
    if (fullName) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { fullName },
        { new: true }
      ).select('-password');
      
      console.log('Test update successful:', updatedUser.fullName);
      
      res.json({
        success: true,
        message: 'Test update successful',
        data: { user: updatedUser.getPublicProfile() }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'fullName is required for test'
      });
    }
  } catch (error) {
    console.error('Test profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Test update failed'
    });
  }
});

// Simple Profile Update
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Profile update request received:', req.body);
    console.log('User ID:', req.user._id);

    const { fullName, mobile, gender, address, currentAddress, state, city, voterId, photo } = req.body;

    // Create update object
    const updateData = {};
    
    if (fullName !== undefined) updateData.fullName = fullName;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (currentAddress !== undefined) updateData.currentAddress = currentAddress;
    if (state !== undefined) updateData.state = state;
    if (city !== undefined) updateData.city = city;
    if (voterId !== undefined) updateData.voterId = voterId;
    if (photo !== undefined) updateData.photo = photo;

    console.log('Update data:', updateData);

    // Check if profile is complete
    const finalData = {
      fullName: updateData.fullName || req.user.fullName,
      mobile: updateData.mobile || req.user.mobile,
      gender: updateData.gender || req.user.gender,
      address: updateData.address || req.user.address,
      currentAddress: updateData.currentAddress || req.user.currentAddress,
      state: updateData.state || req.user.state,
      city: updateData.city || req.user.city,
      voterId: updateData.voterId || req.user.voterId,
      photo: updateData.photo || req.user.photo
    };

    const isComplete = finalData.fullName && finalData.fullName.trim() !== '' &&
                      finalData.mobile && finalData.mobile.trim() !== '' &&
                      finalData.gender && finalData.gender !== 'prefer-not-to-say' &&
                      finalData.address && finalData.address.trim() !== '' &&
                      finalData.currentAddress && finalData.currentAddress.trim() !== '' &&
                      finalData.state && finalData.state.trim() !== '' &&
                      finalData.city && finalData.city.trim() !== '' &&
                      finalData.voterId && finalData.voterId.trim() !== '' &&
                      finalData.photo && finalData.photo.trim() !== '';

    updateData.profileCompleted = isComplete;

    console.log('Profile completion check:', {
      fullName: finalData.fullName,
      mobile: finalData.mobile,
      gender: finalData.gender,
      address: finalData.address,
      currentAddress: finalData.currentAddress,
      state: finalData.state,
      city: finalData.city,
      voterId: finalData.voterId,
      photo: finalData.photo ? 'Photo data present' : 'No photo data',
      isComplete
    });

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User updated successfully:', updatedUser._id);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate field value. Please check your input.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});



// Get user stats
router.get('/stats', authenticateToken, requireVerification, async (req, res) => {
  try {
    const stats = {
      profileCompleted: req.user.profileCompleted,
      emailVerified: req.user.isEmailVerified,
      accountStatus: req.user.isActive ? 'Active' : 'Inactive',
      memberSince: req.user.createdAt,
      lastLogin: req.user.lastLogin
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete account
router.delete('/account', [
  authenticateToken,
  requireVerification,
  body('password').notEmpty().withMessage('Password is required for account deletion')
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

    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Deactivate account instead of deleting
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change password (authenticated users only)
router.put('/change-password', [
  authenticateToken,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Prevent using the same password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
