const express = require('express');
const User = require('../models/User');
const Election = require('../models/Election');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin dashboard summary
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalVoters = await User.countDocuments({ role: 'voter' });

    res.json({
      success: true,
      data: {
        user: req.admin.getPublicProfile(),
        role: 'admin',
        stats: { totalUsers, totalAdmins, totalVoters }
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Manage users - list with search/filter/sort
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { q, sort } = req.query;
    const filter = {};

    if (q) {
      const pattern = new RegExp(q, 'i');
      filter.$or = [
        { fullName: pattern },
        { city: pattern },
        { voterId: pattern }
      ];
    }

    let sortSpec = {};
    if (sort === 'nameAsc') sortSpec = { fullName: 1 };
    else if (sort === 'createdDesc') sortSpec = { createdAt: -1 };
    else if (sort === 'createdAsc') sortSpec = { createdAt: 1 };

    const users = await User.find(filter).select('-password').sort(sortSpec);
    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Lock/unlock user address (must be before /users/:id)
router.post('/users/lock-address', authenticateAdmin, async (req, res) => {
  try {
    const { userIds, lock } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one user must be selected' 
      });
    }

    const users = await User.find({ _id: { $in: userIds } });
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No users found' 
      });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const user of users) {
      try {
        // Only lock if all address fields are filled
        const hasAllAddressFields = !!(
          user.address && user.address.trim() &&
          user.currentAddress && user.currentAddress.trim() &&
          user.state && user.state.trim() &&
          user.district && user.district.trim() &&
          user.taluka && user.taluka.trim() &&
          user.city && user.city.trim()
        );

        if (lock && !hasAllAddressFields) {
          failCount++;
          errors.push({ userId: user._id, email: user.email, error: 'All address fields must be filled to lock' });
          continue;
        }

        user.isAddressLocked = lock === true;
        await user.save();
        successCount++;
      } catch (error) {
        failCount++;
        errors.push({ userId: user._id, email: user.email, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Address ${lock ? 'locked' : 'unlocked'}: ${successCount} successful, ${failCount} failed`,
      data: {
        total: users.length,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Lock/unlock address error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Assign admin role to users (must be before /users/:id)
router.post('/users/assign-admin', authenticateAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one user must be selected' 
      });
    }

    const Admin = require('../models/Admin');
    const users = await User.find({ _id: { $in: userIds }, role: 'voter' }).select('+password');
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No eligible users found (users must have voter role)' 
      });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    const EmailService = require('../utils/emailService');
    const emailService = new EmailService();

    for (const user of users) {
      try {
        // Check if admin already exists with this email
        const existingAdmin = await Admin.findOne({ email: user.email });
        if (existingAdmin) {
          // Admin already exists, just update user role
          user.role = 'admin';
          await user.save();
          successCount++;
          continue;
        }

        // Copy the user's hashed password to admin (both use bcrypt with same salt rounds)
        // Use findOneAndUpdate with upsert to bypass pre-save middleware for password
        await Admin.findOneAndUpdate(
          { email: user.email },
          {
            fullName: user.fullName,
            email: user.email,
            password: user.password, // Copy the already-hashed password from user
            mobile: user.mobile || '',
            updatedAt: new Date()
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
            runValidators: false // Skip validators since password is already hashed
          }
        );

        // Send email notification (they can use their original password)
        try {
          await emailService.sendAdminAccessGrantedEmail(
            user.email,
            user.fullName
          );
        } catch (emailErr) {
          console.error('Failed to send admin access email:', emailErr);
          // Continue even if email fails
        }

        // Update user role
        user.role = 'admin';
        await user.save();
        successCount++;
      } catch (error) {
        failCount++;
        errors.push({ userId: user._id, email: user.email, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Admin role assigned: ${successCount} successful, ${failCount} failed`,
      data: {
        total: users.length,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Assign admin error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Remove admin role from users (must be before /users/:id)
router.post('/users/remove-admin', authenticateAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one user must be selected' 
      });
    }

    const Admin = require('../models/Admin');
    const users = await User.find({ _id: { $in: userIds }, role: 'admin' });
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No admin users found' 
      });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const user of users) {
      try {
        // Remove from Admin collection
        await Admin.deleteOne({ email: user.email });

        // Update user role back to voter
        user.role = 'voter';
        await user.save();
        successCount++;
      } catch (error) {
        failCount++;
        errors.push({ userId: user._id, email: user.email, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Admin role removed: ${successCount} successful, ${failCount} failed`,
      data: {
        total: users.length,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Manage users - get by id (must be after specific routes)
router.get('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user: user.getPublicProfile() } });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Manage users - update
router.put('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      mobile, 
      dateOfBirth, 
      gender, 
      address, 
      currentAddress, 
      state, 
      district,
      taluka,
      city, 
      voterId, 
      photo,
      role, 
      isActive 
    } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !mobile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email, and mobile are required' 
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
    }

    // Check if mobile is already taken by another user
    if (mobile) {
      const existingUser = await User.findOne({ 
        mobile: mobile, 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mobile number already exists' 
        });
      }
    }

    // Validate voter ID format if provided
    if (voterId && !/^[A-Z]{3}\d{7}$/.test(voterId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Voter ID must be 3 uppercase letters followed by 7 digits (e.g., NNI1234567)' 
      });
    }

    // Validate mobile format if provided
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid 10-digit mobile number' 
      });
    }

    // Validate date of birth if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
      
      if (actualAge < 18) {
        return res.status(400).json({ 
          success: false, 
          message: 'User must be at least 18 years old' 
        });
      }
    }

    const updateData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || undefined,
      address: address ? address.trim() : undefined,
      currentAddress: currentAddress ? currentAddress.trim() : undefined,
      state: state ? state.trim() : undefined,
      district: district ? district.trim() : undefined,
      taluka: taluka ? taluka.trim() : undefined,
      city: city ? city.trim() : undefined,
      voterId: voterId ? voterId.trim() : undefined,
      photo: photo || undefined,
      role: role || 'voter',
      isActive: isActive !== undefined ? isActive : true
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'User updated successfully',
      data: { user: user.getPublicProfile() } 
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: Object.values(error.errors)[0].message 
      });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Manage users - delete
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get elections summary for admin dashboard
router.get('/elections', authenticateAdmin, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const elections = await Election.find({ isActive: true })
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const totalElections = await Election.countDocuments({ isActive: true });
    const activeElections = await Election.countDocuments({ status: 'active' });
    const upcomingElections = await Election.countDocuments({ status: 'upcoming' });
    const completedElections = await Election.countDocuments({ status: 'completed' });

    res.json({ 
      success: true, 
      data: { 
        elections,
        stats: {
          total: totalElections,
          active: activeElections,
          upcoming: upcomingElections,
          completed: completedElections
        }
      } 
    });
  } catch (error) {
    console.error('Get elections summary error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Send notifications/announcements to users
router.post('/notifications/send', authenticateAdmin, async (req, res) => {
  try {
    const { userIds, locationFilter, subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject and message are required' 
      });
    }

    const EmailService = require('../utils/emailService');
    const emailService = new EmailService();
    
    let users = [];
    
    // If locationFilter is provided, use it; otherwise use userIds
    if (locationFilter && (locationFilter.state || locationFilter.district || locationFilter.taluka || locationFilter.city)) {
      const filter = { isActive: true };
      if (locationFilter.state) filter.state = locationFilter.state;
      if (locationFilter.district) filter.district = locationFilter.district;
      if (locationFilter.taluka) filter.taluka = locationFilter.taluka;
      if (locationFilter.city) filter.city = locationFilter.city;
      
      users = await User.find(filter).select('email fullName');
    } else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } }).select('email fullName');
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Either userIds or locationFilter must be provided' 
      });
    }
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No users found matching the criteria' 
      });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const user of users) {
      try {
        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>DigiVote</h1>
              <p>Official Announcement</p>
            </div>
            <div class="content">
              <h2>Hello ${user.fullName}!</h2>
              <div class="message">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <p>Best regards,<br/>The DigiVote Admin Team</p>
            </div>
            <div class="footer">
              <p>This is an official message from DigiVote. Please do not reply to this email.</p>
              <p>&copy; 2025 DigiVote App. All rights reserved.</p>
            </div>
          </body>
          </html>
        `;

        const mailOptions = {
          from: `"DigiVote Admin" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: subject,
          html: html
        };

        await emailService.transporter.sendMail(mailOptions);
        successCount++;
      } catch (error) {
        failCount++;
        errors.push({ userId: user._id, email: user.email, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Notifications sent: ${successCount} successful, ${failCount} failed`,
      data: {
        total: users.length,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Send notifications error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Candidates feature removed

module.exports = router;


