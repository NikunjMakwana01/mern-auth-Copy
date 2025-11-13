const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const { authenticateToken } = require('../middleware/auth');
const EmailService = require('../utils/emailService');

const router = express.Router();
const emailService = new EmailService();

// Request voting password (verify email + election card, then send/store password)
router.post('/request-password', [
  body('email').isEmail().normalizeEmail(),
  body('electionCardNumber').matches(/^[A-Z]{3}\d{7}$/).withMessage('Election card number must be 3 uppercase letters followed by 7 digits'),
  body('electionId').isMongoId().withMessage('Invalid election ID')
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, electionCardNumber, electionId } = req.body;
    const userId = req.user._id;

    // Verify user owns the email
    if (req.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Email does not match your account' });
    }

    // Verify election card number matches user
    if (req.user.voterId !== electionCardNumber) {
      return res.status(403).json({ success: false, message: 'Election card number does not match your profile' });
    }

    // Get election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // Check if election is active and within time window
    if (election.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Election is not currently active' });
    }
    const now = new Date();
    if (now < election.votingStartDate || now > election.votingEndDate) {
      return res.status(400).json({ success: false, message: 'Voting is not open at this time' });
    }

    // Load user
    const user = await User.findById(userId);

    // Helper to generate 8-char password
    const generateVotingPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let pwd = '';
      for (let i = 0; i < 8; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
      return pwd;
    };

    // Generate password on-demand (temporary, not saved to database)
    const votingPassword = generateVotingPassword();
    
    // Store temporarily in memory/cache with expiration (using a simple in-memory store)
    // In production, use Redis or similar
    if (!global.votingPasswordCache) {
      global.votingPasswordCache = new Map();
    }
    
    // Store with key: userId_electionId, expires in 24 hours
    const cacheKey = `${userId}_${electionId}`;
    global.votingPasswordCache.set(cacheKey, {
      password: votingPassword,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    
    // Clean up expired entries periodically
    for (const [key, value] of global.votingPasswordCache.entries()) {
      if (value.expiresAt < Date.now()) {
        global.votingPasswordCache.delete(key);
      }
    }

    // Send email with password
    await emailService.sendVotingPassword(
      user.email,
      user.fullName,
      election.title,
      votingPassword
    );

    return res.json({ success: true, message: 'Voting password sent to your email' });
  } catch (error) {
    console.error('Request voting password error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Verify voting credentials (email, election card number, password)
router.post('/verify-credentials', [
  body('email').isEmail().normalizeEmail(),
  body('electionCardNumber').matches(/^[A-Z]{3}\d{7}$/).withMessage('Election card number must be 3 uppercase letters followed by 7 digits'),
  body('votingPassword').isLength({ min: 8, max: 8 }).withMessage('Voting password must be 8 characters'),
  body('electionId').isMongoId().withMessage('Invalid election ID')
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, electionCardNumber, votingPassword, electionId } = req.body;
    const userId = req.user._id;

    // Verify user owns the email
    if (req.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Email does not match your account'
      });
    }

    // Verify election card number matches user
    if (req.user.voterId !== electionCardNumber) {
      return res.status(403).json({
        success: false,
        message: 'Election card number does not match your profile'
      });
    }

    // Get election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if election is active
    if (election.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Election is not currently active'
      });
    }

    // Check if voting is open
    const now = new Date();
    if (now < election.votingStartDate || now > election.votingEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Voting is not open at this time'
      });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({ electionId, userId });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this election'
      });
    }

    // Verify voting password from temporary cache
    if (!global.votingPasswordCache) {
      global.votingPasswordCache = new Map();
    }
    
    const cacheKey = `${userId}_${electionId}`;
    const cachedPassword = global.votingPasswordCache.get(cacheKey);
    
    if (!cachedPassword || cachedPassword.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Voting password expired or not found. Please request a new password.'
      });
    }

    if (cachedPassword.password !== votingPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid voting password'
      });
    }
    
    // Remove password from cache after successful verification (one-time use)
    global.votingPasswordCache.delete(cacheKey);

    // Get candidates for this election
    const candidates = await Candidate.find({
      'assignedElections.electionId': electionId,
      status: 'active',
      isActive: true
    }).select('name partyName partySymbol candidatePhoto village assignedElections');

    res.json({
      success: true,
      message: 'Credentials verified successfully',
      data: {
        election: {
          _id: election._id,
          title: election.title,
          type: election.type,
          level: election.level
        },
        candidates: candidates.map(c => ({
          _id: c._id,
          name: c.name,
          partyName: c.partyName,
          partySymbol: c.partySymbol,
          candidatePhoto: c.candidatePhoto,
          village: c.village
        }))
      }
    });

  } catch (error) {
    console.error('Verify credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cast vote
router.post('/cast-vote', [
  body('electionId').isMongoId().withMessage('Invalid election ID'),
  body('candidateId').isMongoId().withMessage('Invalid candidate ID')
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { electionId, candidateId } = req.body;
    const userId = req.user._id;

    // Check if user already voted
    const existingVote = await Vote.findOne({ electionId, userId });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this election'
      });
    }

    // Get election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if election is active
    if (election.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Election is not currently active'
      });
    }

    // Check if voting is open
    const now = new Date();
    if (now < election.votingStartDate || now > election.votingEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Voting is not open at this time'
      });
    }

    // Verify candidate is assigned to this election
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    const isAssigned = candidate.assignedElections.some(
      ae => ae.electionId.toString() === electionId.toString()
    );

    if (!isAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Candidate is not assigned to this election'
      });
    }

    // Create vote
    const vote = new Vote({
      electionId,
      userId,
      candidateId,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await vote.save();

    // Update election vote count
    const candidateEntry = election.candidates.find(
      c => c.candidateId.toString() === candidateId.toString()
    );

    if (candidateEntry) {
      candidateEntry.votes += 1;
    } else {
      // If candidate not in election.candidates array, add them
      election.candidates.push({
        candidateId,
        party: candidate.partyName,
        symbol: candidate.partySymbol,
        votes: 1,
        votePercentage: 0
      });
    }

    election.totalVotesCast += 1;
    election.calculateTurnout();
    election.updateCandidatePercentages();
    await election.save();

    res.json({
      success: true,
      message: 'Vote cast successfully',
      data: {
        voteId: vote._id,
        candidateId,
        votedAt: vote.votedAt
      }
    });

  } catch (error) {
    console.error('Cast vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check vote status for an election
router.get('/check-status/:electionId', authenticateToken, async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user._id;

    const vote = await Vote.findOne({ electionId, userId })
      .populate('candidateId', 'name partyName partySymbol candidatePhoto');

    if (!vote) {
      return res.json({
        success: true,
        data: {
          hasVoted: false
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasVoted: true,
        vote: {
          candidateId: vote.candidateId._id,
          candidateName: vote.candidateId.name,
          partyName: vote.candidateId.partyName,
          partySymbol: vote.candidateId.partySymbol,
          candidatePhoto: vote.candidateId.candidatePhoto,
          votedAt: vote.votedAt,
          viewCount: vote.viewCount,
          canView: vote.viewCount < 2
        }
      }
    });

  } catch (error) {
    console.error('Check vote status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// View vote (increment view count)
router.post('/view-vote/:electionId', authenticateToken, async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user._id;

    const vote = await Vote.findOne({ electionId, userId })
      .populate('candidateId', 'name partyName partySymbol candidatePhoto village');

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }

    if (vote.viewCount >= 2) {
      return res.status(403).json({
        success: false,
        message: 'You have already viewed your vote the maximum number of times (2)'
      });
    }

    vote.viewCount += 1;
    vote.lastViewedAt = new Date();
    await vote.save();

    res.json({
      success: true,
      data: {
        candidate: {
          _id: vote.candidateId._id,
          name: vote.candidateId.name,
          partyName: vote.candidateId.partyName,
          partySymbol: vote.candidateId.partySymbol,
          candidatePhoto: vote.candidateId.candidatePhoto,
          village: vote.candidateId.village
        },
        votedAt: vote.votedAt,
        viewCount: vote.viewCount,
        remainingViews: 2 - vote.viewCount
      }
    });

  } catch (error) {
    console.error('View vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

