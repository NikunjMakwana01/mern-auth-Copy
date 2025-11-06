const express = require('express');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');
const EmailService = require('../utils/emailService');
const { authenticateAdmin, authenticateToken, requireVerification } = require('../middleware/auth');

const router = express.Router();

// Get all elections with filtering and pagination
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      state, 
      search,
      archived,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Sweep statuses on each list request to keep statuses in sync with time
    const now = new Date();
    await Election.updateMany({ status: { $in: ['draft', 'upcoming'] }, votingStartDate: { $lte: now } }, { $set: { status: 'active' } });
    await Election.updateMany({ status: 'active', votingEndDate: { $lt: now } }, { $set: { status: 'completed' } });

    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (state) filter.state = state;
    // archived filter: only apply if provided explicitly
    if (archived === 'true') filter.archived = true; 
    if (archived === 'false') filter.archived = false;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { title: searchRegex },
        { villageCity: searchRegex }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const elections = await Election.find(filter)
      .populate('createdBy', 'fullName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Election.countDocuments(filter);

    res.json({
      success: true,
      data: {
        elections,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalElections: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get elections available for the authenticated user (active or upcoming)
router.get('/available', authenticateToken, async (req, res) => {
  try {
    // Sweep statuses before serving available list
    const now = new Date();
    await Election.updateMany({ status: { $in: ['draft', 'upcoming'] }, votingStartDate: { $lte: now } }, { $set: { status: 'active' } });
    await Election.updateMany({ status: 'active', votingEndDate: { $lt: now } }, { $set: { status: 'completed' } });
    const user = req.user;

    const baseFilter = { archived: false, status: { $in: ['active', 'upcoming'] } };

    // Build location-aware filters by election level
    const orFilters = [
      // National level elections
      { level: 'National' },
    ];

    if (user.state) {
      // State level
      orFilters.push({ level: 'State', state: user.state });
    }
    if (user.state && user.district) {
      // District level
      orFilters.push({ level: 'District', state: user.state, district: user.district });
      
      // Village/Municipal level elections - show all that match state and district
      // Always include elections matching state and district
      orFilters.push({
        level: { $in: ['Village', 'Municipal'] },
        state: user.state,
        district: user.district
      });
    }

    const filter = { ...baseFilter, $or: orFilters };

    const elections = await Election.find(filter)
      .sort({ status: 1, votingStartDate: 1 })
      .lean();

    res.json({ success: true, data: { elections } });
  } catch (error) {
    console.error('Get available elections error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Alias endpoint to avoid any param-route conflicts
router.get('/available-user', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    await Election.updateMany({ status: { $in: ['draft', 'upcoming'] }, votingStartDate: { $lte: now } }, { $set: { status: 'active' } });
    await Election.updateMany({ status: 'active', votingEndDate: { $lt: now } }, { $set: { status: 'completed' } });
    const user = req.user;
    const baseFilter = { archived: false, status: { $in: ['active', 'upcoming'] } };
    const orFilters = [{ level: 'National' }];
    
    // Debug logging
    console.log('Available elections - User location:', {
      userId: user._id,
      state: user.state,
      district: user.district,
      taluka: user.taluka,
      city: user.city,
      profileCompleted: user.profileCompleted
    });
    
    // Build filters based on user location
    // Use aggregation to normalize state/district for case-insensitive matching
    if (user.state) {
      const userState = user.state.trim();
      
      // State level elections
      orFilters.push({ 
        level: 'State', 
        state: { $regex: new RegExp(`^${userState.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      
      if (user.district) {
        const userDistrict = user.district.trim();
        
        // District level elections
        orFilters.push({ 
          level: 'District', 
          state: { $regex: new RegExp(`^${userState.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          district: { $regex: new RegExp(`^${userDistrict.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
        
        // Village/Municipal level elections - match by state and district
        orFilters.push({
          level: { $in: ['Village', 'Municipal'] },
          state: { $regex: new RegExp(`^${userState.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          district: { $regex: new RegExp(`^${userDistrict.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
      } else {
        // User has state but no district - show all village/municipal elections in that state
        orFilters.push({
          level: { $in: ['Village', 'Municipal'] },
          state: { $regex: new RegExp(`^${userState.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
      }
    }
    
    const filter = { ...baseFilter, $or: orFilters };
    console.log('Available elections - Filter:', JSON.stringify(filter, null, 2));
    
    const elections = await Election.find(filter).sort({ status: 1, votingStartDate: 1 }).lean();
    console.log('Available elections - Found:', elections.length, 'elections');
    
    res.json({ success: true, data: { elections } });
  } catch (error) {
    console.error('Get available-user elections error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get single election by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    res.json({ success: true, data: { election } });
  } catch (error) {
    console.error('Get election error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create new election
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      level,
      panchayatName,
      state,
      district,
      taluka,
      villageCity,
      constituency,
      votingStartDate,
      votingEndDate,
      resultDeclarationDate,
      eligibilityCriteria,
      security,
      notes
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !level || !votingStartDate || !votingEndDate || !resultDeclarationDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, type, level, and all dates are required'
      });
    }

    // Validate dates
    const startDate = new Date(votingStartDate);
    const endDate = new Date(votingEndDate);
    const resultDate = new Date(resultDeclarationDate);
    const now = new Date();

    if (startDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Voting start date must be in the future'
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'Voting end date must be after start date'
      });
    }

    if (resultDate < endDate) {
      return res.status(400).json({
        success: false,
        message: 'Result declaration date must be on or after voting end date'
      });
    }

    const election = new Election({
      title: title.trim(),
      description: description.trim(),
      type,
      level,
      panchayatName: panchayatName ? panchayatName.trim() : undefined,
      state: state ? state.trim() : undefined,
      district: district ? district.trim() : undefined,
      taluka: taluka ? taluka.trim() : undefined,
      villageCity: villageCity ? villageCity.trim() : undefined,
      constituency: constituency ? constituency.trim() : undefined,
      votingStartDate: startDate,
      votingEndDate: endDate,
      resultDeclarationDate: resultDate,
      eligibilityCriteria: eligibilityCriteria || {},
      security: security || {},
      notes: notes ? notes.trim() : undefined,
      createdBy: req.admin._id
    });

    await election.save();

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      data: { election }
    });
  } catch (error) {
    console.error('Create election error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message
      });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update election
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      level,
      panchayatName,
      state,
      district,
      taluka,
      villageCity,
      constituency,
      votingStartDate,
      votingEndDate,
      resultDeclarationDate,
      eligibilityCriteria,
      security,
      notes,
      status
    } = req.body;

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // Determine if only status-to-completed change is requested while active
    const incomingKeys = Object.keys(req.body || {});
    const onlyStatusChange = incomingKeys.length === 1 && incomingKeys[0] === 'status';
    const activeToCompleted = onlyStatusChange && election.status === 'active' && status === 'completed';

    // Only block updates for non-editable statuses, except allow active -> completed
    const nonEditableStatuses = ['active', 'completed', 'cancelled', 'postponed'];
    if (nonEditableStatuses.includes(election.status) && !activeToCompleted) {
      return res.status(400).json({ success: false, message: 'Updates are not allowed after activation' });
    }

    const now = new Date();
    const anyDateChanged = (
      typeof votingStartDate !== 'undefined' ||
      typeof votingEndDate !== 'undefined' ||
      typeof resultDeclarationDate !== 'undefined'
    );

    if (anyDateChanged) {
      if (election.status === 'active' && !activeToCompleted) {
        return res.status(400).json({ success: false, message: 'Cannot change dates after activation' });
      }
      // Compose prospective dates from incoming values or existing ones
      const newStart = votingStartDate ? new Date(votingStartDate) : election.votingStartDate;
      const newEnd = votingEndDate ? new Date(votingEndDate) : election.votingEndDate;
      const newResult = resultDeclarationDate ? new Date(resultDeclarationDate) : election.resultDeclarationDate;

      // Validate dates relationship (minute-level precision supported)
      if (!(newStart > now)) {
        return res.status(400).json({ success: false, message: 'Voting start date must be in the future' });
      }
      if (!(newEnd > newStart)) {
        return res.status(400).json({ success: false, message: 'Voting end date must be after start date' });
      }
      if (!(newResult >= newEnd)) {
        return res.status(400).json({ success: false, message: 'Result declaration date must be on or after voting end date' });
      }

      // Apply validated dates
      election.votingStartDate = newStart;
      election.votingEndDate = newEnd;
      election.resultDeclarationDate = newResult;
    }

    // Apply scalar updates
    if (!activeToCompleted) {
      if (title) election.title = title.trim();
      if (description) election.description = description.trim();
      if (type) election.type = type;
      if (level) election.level = level;
      if (panchayatName !== undefined) election.panchayatName = panchayatName ? panchayatName.trim() : undefined;
      if (state !== undefined) election.state = state ? state.trim() : undefined;
      if (district !== undefined) election.district = district ? district.trim() : undefined;
      if (taluka !== undefined) election.taluka = taluka ? taluka.trim() : undefined;
      if (villageCity !== undefined) election.villageCity = villageCity ? villageCity.trim() : undefined;
      if (constituency !== undefined) election.constituency = constituency ? constituency.trim() : undefined;
      if (eligibilityCriteria) election.eligibilityCriteria = eligibilityCriteria;
      if (security) election.security = security;
      if (notes !== undefined) election.notes = notes ? notes.trim() : undefined;
    }
    if (status) {
      // If admin manually changes to completed, ensure end date is in the past
      if (status === 'completed') {
        const nowForComplete = new Date();
        const endToCheck = election.votingEndDate;
        if (endToCheck > nowForComplete) {
          return res.status(400).json({ success: false, message: 'Cannot mark as completed before end date/time.' });
        }
      }
      election.status = status;
    }

    const saved = await election.save();
    await saved.populate('createdBy', 'fullName email');

    res.json({
      success: true,
      message: 'Election updated successfully',
      data: { election: saved }
    });
  } catch (error) {
    console.error('Update election error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message
      });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete election (only draft or upcoming). Active cannot be deleted. Completed remain archived.
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    if (election.status === 'active') {
      return res.status(400).json({ success: false, message: 'Cannot remove an active election' });
    }

    // Soft remove -> archive instead of permanent delete
    election.archived = true;
    await election.save();
    res.json({ success: true, message: 'Election removed (archived). You can restore it from history.' });
  } catch (error) {
    console.error('Delete election error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Election statistics feature removed (no candidates/votes)

// Start election (change status to active)
router.post('/:id/start', authenticateAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    if (election.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Only upcoming elections can be started'
      });
    }

    const now = new Date();
    if (election.votingStartDate > now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start election before voting start date'
      });
    }

    election.status = 'active';
    await election.save();

    res.json({
      success: true,
      message: 'Election started successfully',
      data: { election }
    });
  } catch (error) {
    console.error('Start election error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// End election (change status to completed)
router.post('/:id/end', authenticateAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    if (election.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active elections can be ended'
      });
    }

    const now = new Date();
    if (election.votingEndDate > now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot end election before voting end date'
      });
    }

    election.status = 'completed';
    await election.save();

    res.json({
      success: true,
      message: 'Election ended successfully',
      data: { election }
    });
  } catch (error) {
    console.error('End election error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Archive (remove from manage list) without permanent delete
router.post('/:id/archive', authenticateAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    if (election.status === 'active') {
      return res.status(400).json({ success: false, message: 'Cannot archive an active election' });
    }
    election.archived = true;
    await election.save();
    res.json({ success: true, message: 'Election archived' });
  } catch (error) {
    console.error('Archive election error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Restore from archive
router.post('/:id/restore', authenticateAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    if (election.archived === false) {
      return res.json({ success: true, message: 'Election already restored' });
    }
    election.archived = false;
    await election.save();
    res.json({ success: true, message: 'Election restored successfully' });
  } catch (error) {
    console.error('Restore election error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Permanently delete a completed election from database (from history)
router.delete('/:id/permanent', authenticateAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    if (!['completed', 'upcoming', 'draft'].includes(election.status)) {
      return res.status(400).json({ success: false, message: 'Only completed, upcoming, or draft elections can be permanently deleted' });
    }
    await Election.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Election permanently deleted' });
  } catch (error) {
    console.error('Permanent delete election error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get admin results summary for an election
router.get('/:id/results', authenticateAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('candidates.candidateId', 'name partyName partySymbol candidatePhoto')
      .lean();
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    // Village voter stats based on election location
    const userFilter = { isActive: true, profileCompleted: true };
    if (election.state) userFilter.state = election.state;
    if (election.district) userFilter.district = election.district;
    if (election.taluka) userFilter.taluka = election.taluka;
    if (election.villageCity) userFilter.city = election.villageCity;
    const totalVillageVoters = await User.countDocuments(userFilter);
    const villageUsers = await User.find(userFilter).select('_id');
    const villageUserIds = villageUsers.map(u => u._id);
    const totalVillageVoted = await Vote.countDocuments({ electionId: election._id, userId: { $in: villageUserIds } });
    // Sort candidates by votes desc
    const candidates = (election.candidates || [])
      .map(c => ({
        candidateId: c.candidateId?._id || c.candidateId,
        name: c.candidateId?.name,
        partyName: c.candidateId?.partyName || c.party,
        partySymbol: c.candidateId?.partySymbol || c.symbol,
        candidatePhoto: c.candidateId?.candidatePhoto,
        votes: c.votes,
        votePercentage: c.votePercentage
      }))
      .sort((a,b) => b.votes - a.votes);

    res.json({
      success: true,
      data: {
        election: {
          _id: election._id,
          title: election.title,
          status: election.status,
          totalVotesCast: election.totalVotesCast,
          turnoutPercentage: election.turnoutPercentage,
          results: election.results || { isDeclared: false },
          villageStats: {
            totalVoters: totalVillageVoters,
            totalVoted: totalVillageVoted
          }
        },
        candidates
      }
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Publish results (declare winner) for completed election
router.post('/:id/publish-results', authenticateAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('candidates.candidateId', 'name');
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    // Only allow if voting ended
    const now = new Date();
    if (election.votingEndDate > now) {
      return res.status(400).json({ success: false, message: 'Cannot publish results before voting end time' });
    }
    // Compute percentages if needed
    election.calculateTurnout();
    election.updateCandidatePercentages();
    // Declare winner and mark results
    const winner = election.declareWinner();
    await election.save();

    // After publishing, email users in the election's location with summary and voter list
    try {
      const emailService = new EmailService();
      const locationFilter = { isActive: true, profileCompleted: true };
      if (election.state) locationFilter.state = election.state;
      if (election.district) locationFilter.district = election.district;
      if (election.taluka) locationFilter.taluka = election.taluka;
      if (election.villageCity) locationFilter.city = election.villageCity;

      const recipients = await User.find(locationFilter).select('email fullName');
      const votes = await Vote.find({ electionId: election._id }).populate('userId', 'fullName email');
      const voterNames = votes.map(v => v.userId?.fullName).filter(Boolean);
      const top = election.candidates.reduce((a,b)=> (a.votes>b.votes?a:b), { votes: -1 });
      const subject = `Results Published - ${election.title}`;
      const summary = `Winner: ${top?.candidateId?.name || 'N/A'} with ${top?.votes || 0} votes. Total votes: ${election.totalVotesCast}. Turnout: ${election.turnoutPercentage}%.`;
      const votersLine = voterNames.length ? `\nVoters: ${voterNames.slice(0,100).join(', ')}${voterNames.length>100?' and more...':''}` : '';
      for (const r of recipients) {
        // lightweight text email using sendOTPEmail template as generic mailer fallback
        await emailService.sendOTPEmail(r.email, 'RESULT', 'email-verification');
        // Note: Real implementation would have a dedicated template; placeholder call keeps transport settings consistent
        console.log(`Result summary email queued to ${r.email}: ${summary}${votersLine}`);
      }
    } catch (emailErr) {
      console.error('Result email dispatch error:', emailErr.message);
    }
    res.json({
      success: true,
      message: 'Results published successfully',
      data: {
        winner: winner ? {
          candidateId: winner.candidateId,
          name: winner.candidateId?.name,
          votes: winner.votes,
          percentage: winner.votePercentage
        } : null,
        results: election.results
      }
    });
  } catch (error) {
    console.error('Publish results error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Public results for users
router.get('/:id/results-public', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('candidates.candidateId', 'name partyName partySymbol candidatePhoto')
      .lean();
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    if (!election.results || !election.results.isDeclared) {
      return res.status(400).json({ success: false, message: 'Results not published yet' });
    }
    // Village stats
    const uf = { isActive: true, profileCompleted: true };
    if (election.state) uf.state = election.state;
    if (election.district) uf.district = election.district;
    if (election.taluka) uf.taluka = election.taluka;
    if (election.villageCity) uf.city = election.villageCity;
    const totalVillageVoters = await User.countDocuments(uf);
    const villageUsers = await User.find(uf).select('_id');
    const villageUserIds = villageUsers.map(u => u._id);
    const totalVillageVoted = await Vote.countDocuments({ electionId: election._id, userId: { $in: villageUserIds } });
    const candidates = (election.candidates || [])
      .map(c => ({
        candidateId: c.candidateId?._id || c.candidateId,
        name: c.candidateId?.name,
        partyName: c.candidateId?.partyName || c.party,
        partySymbol: c.candidateId?.partySymbol || c.symbol,
        candidatePhoto: c.candidateId?.candidatePhoto,
        votes: c.votes,
        votePercentage: c.votePercentage
      }))
      .sort((a,b) => b.votes - a.votes);
    res.json({ success: true, data: { election: {
      _id: election._id,
      title: election.title,
      status: election.status,
      totalVotesCast: election.totalVotesCast,
      turnoutPercentage: election.turnoutPercentage,
      results: election.results,
      villageStats: { totalVoters: totalVillageVoters, totalVoted: totalVillageVoted }
    }, candidates } });
  } catch (error) {
    console.error('Public results error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Published elections for current user (location-based)
router.get('/published-user/list', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const filter = {
      archived: false,
      'results.isDeclared': true,
      status: { $in: ['completed'] }
    };
    const orFilters = [{ level: 'National' }];
    if (user.state) {
      orFilters.push({ level: 'State', state: user.state });
      if (user.district) {
        orFilters.push({ level: 'District', state: user.state, district: user.district });
        orFilters.push({ level: { $in: ['Village', 'Municipal'] }, state: user.state, district: user.district });
      } else {
        orFilters.push({ level: { $in: ['Village', 'Municipal'] }, state: user.state });
      }
    }
    const elections = await Election.find({ ...filter, $or: orFilters }).sort({ resultDeclarationDate: -1 }).lean();
    res.json({ success: true, data: { elections } });
  } catch (error) {
    console.error('Published-user list error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Public: published elections by location (state/district/taluka/city via query)
router.get('/published-list', async (req, res) => {
  try {
    const { state, district, taluka, city } = req.query;
    const filter = {
      archived: false,
      'results.isDeclared': true,
      status: { $in: ['completed'] }
    };
    const orFilters = [{ level: 'National' }];
    if (state) {
      orFilters.push({ level: 'State', state });
      if (district) {
        orFilters.push({ level: 'District', state, district });
        orFilters.push({ level: { $in: ['Village', 'Municipal'] }, state, district });
        if (taluka) {
          // Not stored directly on list, but keep filter flexible
        }
        if (city) {
          orFilters.push({ level: { $in: ['Village', 'Municipal'] }, state, district, villageCity: city });
        }
      } else {
        orFilters.push({ level: { $in: ['Village', 'Municipal'] }, state });
      }
    }
    const elections = await Election.find({ ...filter, $or: orFilters }).sort({ resultDeclarationDate: -1 }).lean();
    res.json({ success: true, data: { elections } });
  } catch (error) {
    console.error('Published list (public) error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Remove candidate from election
router.delete('/:id/candidates/:candidateId', authenticateAdmin, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const Candidate = require('../models/Candidate');

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Only disallow removal for active elections; allow upcoming and completed
    if (election.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove candidate from an active election'
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Remove candidate from election's candidates array
    const candidateIndex = election.candidates.findIndex(
      c => c.candidateId.toString() === candidateId.toString()
    );

    if (candidateIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Candidate is not assigned to this election'
      });
    }

    election.candidates.splice(candidateIndex, 1);
    await election.save();

    // Remove election from candidate's assignedElections array
    if (candidate.assignedElections && candidate.assignedElections.length > 0) {
      candidate.assignedElections = candidate.assignedElections.filter(
        e => e.electionId.toString() !== election._id.toString()
      );
      await candidate.save();
    }

    res.json({
      success: true,
      message: 'Candidate removed from election successfully',
      data: { election }
    });
  } catch (error) {
    console.error('Remove candidate from election error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add candidate to election
router.post('/:id/candidates', authenticateAdmin, async (req, res) => {
  try {
    const { candidateId } = req.body;
    const Candidate = require('../models/Candidate');

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required'
      });
    }

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if election is upcoming (only allow assignment to upcoming elections)
    if (election.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Can only assign candidates to upcoming elections'
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Check if candidate is already assigned to this election
    const alreadyAssigned = election.candidates.some(
      c => c.candidateId.toString() === candidateId.toString()
    );

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Candidate is already assigned to this election'
      });
    }

    // Allow multiple assignments: add this election to candidate.assignedElections if not already present
    if (!candidate.assignedElections) {
      candidate.assignedElections = [];
    }
    const alreadyInAssigned = candidate.assignedElections.some(
      (ae) => ae.electionId.toString() === election._id.toString()
    );
    if (!alreadyInAssigned) {
      candidate.assignedElections.push({
        electionId: election._id,
        electionTitle: election.title,
        assignedAt: new Date()
      });
    }
    await candidate.save();

    // Add candidate to election if not already present
    const inElection = election.candidates.some(
      (c) => c.candidateId.toString() === candidate._id.toString()
    );
    if (!inElection) {
      election.candidates.push({
        candidateId: candidate._id,
        party: candidate.partyName || undefined,
        symbol: candidate.partySymbol || undefined,
        votes: 0,
        votePercentage: 0
      });
    }

    await election.save();

    res.json({
      success: true,
      message: 'Candidate assigned to election successfully',
      data: { election }
    });
  } catch (error) {
    console.error('Add candidate to election error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Remove candidate from election
router.delete('/:id/candidates/:candidateId', authenticateAdmin, async (req, res) => {
  try {
    const Candidate = require('../models/Candidate');
    const { candidateId } = req.params;

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Only disallow removal for active elections; allow upcoming and completed
    if (election.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove candidate from an active election'
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Remove candidate from election's candidates array
    election.candidates = election.candidates.filter(
      c => c.candidateId.toString() !== candidateId.toString()
    );

    // Remove election from candidate's assignedElections array
    if (candidate.assignedElections) {
      candidate.assignedElections = candidate.assignedElections.filter(
        e => e.electionId.toString() !== election._id.toString()
      );
      await candidate.save();
    }

    await election.save();

    res.json({
      success: true,
      message: 'Candidate removed from election successfully',
      data: { election }
    });
  } catch (error) {
    console.error('Remove candidate from election error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get election types and their descriptions
router.get('/meta/types', authenticateAdmin, async (req, res) => {
  try {
    const electionTypes = [
      {
        type: 'Lok Sabha',
        description: 'General Elections for the Lower House of Parliament',
        level: 'National',
        term: '5 years',
        constituencies: '543 constituencies across India'
      },
      {
        type: 'Rajya Sabha',
        description: 'Elections for the Upper House of Parliament',
        level: 'National',
        term: '6 years (1/3 members retire every 2 years)',
        constituencies: 'Indirect election by state legislators'
      },
      {
        type: 'State Assembly',
        description: 'Elections for State Legislative Assembly',
        level: 'State',
        term: '5 years',
        constituencies: 'Multiple constituencies within the state'
      },
      {
        type: 'Municipal Corporation',
        description: 'Elections for Municipal Corporation',
        level: 'Municipal',
        term: '5 years',
        constituencies: 'Wards within the municipal area'
      },
      {
        type: 'Panchayat',
        description: 'Village Council Elections',
        level: 'Village',
        term: '5 years',
        constituencies: 'Village-level constituencies'
      },
      {
        type: 'Zila Parishad',
        description: 'District Council Elections',
        level: 'District',
        term: '5 years',
        constituencies: 'District-level constituencies'
      },
      {
        type: 'Block Development',
        description: 'Block Development Council Elections',
        level: 'Block',
        term: '5 years',
        constituencies: 'Block-level constituencies'
      },
      {
        type: 'Mayor',
        description: 'Mayoral Elections',
        level: 'Municipal',
        term: '5 years',
        constituencies: 'City-wide election'
      }
    ];

    res.json({
      success: true,
      data: { electionTypes }
    });
  } catch (error) {
    console.error('Get election types error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
