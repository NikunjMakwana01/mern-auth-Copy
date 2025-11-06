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

// Manage users - get by id
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

// Candidates feature removed

module.exports = router;


