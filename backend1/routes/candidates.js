const express = require('express');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all candidates with filtering and pagination
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      partyName,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (partyName) filter.partyName = { $regex: new RegExp(partyName, 'i') };
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { village: searchRegex },
        { aadharCardNumber: searchRegex },
        { electionCardNumber: searchRegex },
        { partyName: searchRegex }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const candidates = await Candidate.find(filter)
      .populate('createdBy', 'fullName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Candidate.countDocuments(filter);

    // Check which candidates are assigned to elections
    const candidateIds = candidates.map(c => c._id);
    const electionsWithCandidates = await Election.find({
      'candidates.candidateId': { $in: candidateIds }
    }).select('candidates title').lean();

    // Map candidates with assignment status
    const candidatesWithStatus = candidates.map(candidate => {
      const isAssigned = electionsWithCandidates.some(election =>
        election.candidates.some(c => c.candidateId.toString() === candidate._id.toString())
      );
      return {
        ...candidate,
        isAssigned,
        assignedElectionsCount: electionsWithCandidates.filter(election =>
          election.candidates.some(c => c.candidateId.toString() === candidate._id.toString())
        ).length
      };
    });

    res.json({
      success: true,
      data: {
        candidates: candidatesWithStatus,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCandidates: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get single candidate by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Get full election details for assigned elections and merge with candidate's assignedElections array
    const assignedElectionIds = candidate.assignedElections?.map(e => e.electionId) || [];
    const elections = await Election.find({
      _id: { $in: assignedElectionIds }
    }).select('title status votingStartDate votingEndDate type level state district villageCity description').lean();

    // Merge election details with assignedElections array
    const enrichedAssignedElections = candidate.assignedElections?.map(ae => {
      const electionDetails = elections.find(e => e._id.toString() === ae.electionId.toString());
      return {
        ...ae.toObject ? ae.toObject() : ae,
        ...electionDetails
      };
    }) || [];

    res.json({
      success: true,
      data: {
        candidate: {
          ...candidate.toObject(),
          isAssigned: elections.length > 0,
          assignedElections: enrichedAssignedElections,
          assignedElectionsDetails: enrichedAssignedElections
        }
      }
    });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create new candidate
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('=== CREATE CANDIDATE REQUEST ===');
    // Avoid logging full request body with large base64 images
    const {
      name,
      village,
      aadharCardNumber,
      electionCardNumber,
      candidatePhoto,
      partyName,
      partySymbol,
      contactNumber,
      email,
      address,
      state,
      district,
      taluka,
      status,
      notes
    } = req.body;
    
    console.log('Extracted values:', {
      name: name ? `${name.substring(0, 20)}...` : 'MISSING',
      village: village ? `${village.substring(0, 20)}...` : 'MISSING',
      electionCardNumber: electionCardNumber || 'MISSING',
      partyName: partyName ? `${partyName.substring(0, 20)}...` : 'MISSING',
      aadharCardNumber: aadharCardNumber ? 'PROVIDED' : 'NOT PROVIDED (OK)',
      hasCandidatePhoto: !!candidatePhoto,
      hasPartySymbol: !!partySymbol,
      hasElectionCardPhoto: !!req.body.electionCardPhoto,
      candidatePhotoSize: candidatePhoto ? `${Math.round(candidatePhoto.length / 1024)}KB` : 'N/A',
      partySymbolSize: partySymbol ? `${Math.round(partySymbol.length / 1024)}KB` : 'N/A'
    });

    // Validate required fields - check for truthy values and non-empty strings
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    if (!village || typeof village !== 'string' || !village.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Village is required'
      });
    }
    if (!electionCardNumber || typeof electionCardNumber !== 'string' || !electionCardNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Election card number is required'
      });
    }
    if (!partyName || typeof partyName !== 'string' || !partyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Party name is required'
      });
    }

    // Check for duplicate Aadhar card number only if provided
    if (aadharCardNumber && aadharCardNumber.trim()) {
      const existingAadhar = await Candidate.findOne({ aadharCardNumber: aadharCardNumber.trim() });
      if (existingAadhar) {
        return res.status(400).json({
          success: false,
          message: 'Candidate with this Aadhar card number already exists'
        });
      }
    }

    // Check for duplicate Election card number
    const existingElectionCard = await Candidate.findOne({ electionCardNumber });
    if (existingElectionCard) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this Election card number already exists'
      });
    }

    // Prepare candidate data - ensure no undefined values for required fields
    const candidateData = {
      name: name.trim(),
      village: village.trim(),
      electionCardNumber: electionCardNumber.trim(),
      partyName: partyName.trim(),
      status: status || 'active',
      createdBy: req.admin._id
    };
    
    // Add optional fields only if they have values
    if (aadharCardNumber && aadharCardNumber.trim()) {
      candidateData.aadharCardNumber = aadharCardNumber.trim();
    }
    if (candidatePhoto && candidatePhoto.trim()) {
      candidateData.candidatePhoto = candidatePhoto;
    }
    if (partySymbol && partySymbol.trim()) {
      candidateData.partySymbol = partySymbol;
    }
    if (req.body.electionCardPhoto && req.body.electionCardPhoto.trim()) {
      candidateData.electionCardPhoto = req.body.electionCardPhoto;
    }
    if (contactNumber && contactNumber.trim()) {
      candidateData.contactNumber = contactNumber.trim();
    }
    if (email && email.trim()) {
      candidateData.email = email.trim().toLowerCase();
    }
    if (address && address.trim()) {
      candidateData.address = address.trim();
    }
    if (state && state.trim()) {
      candidateData.state = state.trim();
    }
    if (district && district.trim()) {
      candidateData.district = district.trim();
    }
    if (taluka && taluka.trim()) {
      candidateData.taluka = taluka.trim();
    }
    if (notes && notes.trim()) {
      candidateData.notes = notes.trim();
    }

    const candidate = new Candidate(candidateData);

    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: { candidate }
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    // Don't log full request body (contains large base64 images)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors,
      candidateName: req.body?.name || 'N/A',
      hasImages: !!(req.body?.candidatePhoto || req.body?.partySymbol || req.body?.electionCardPhoto)
    });
    
    if (error.name === 'ValidationError') {
      // Collect all validation errors
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', ') || 'Validation error occurred'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this Aadhar card number or Election card number already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

// Update candidate
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      village,
      aadharCardNumber,
      electionCardNumber,
      candidatePhoto,
      partyName,
      partySymbol,
      contactNumber,
      email,
      address,
      state,
      district,
      taluka,
      status,
      notes
    } = req.body;

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Check if candidate is assigned to active elections
    const activeElections = await Election.find({
      'candidates.candidateId': candidate._id,
      status: { $in: ['active', 'upcoming'] }
    });

    if (activeElections.length > 0 && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate candidate assigned to active or upcoming elections'
      });
    }

    // Update fields
    if (name) candidate.name = name.trim();
    if (village) candidate.village = village.trim();
    if (aadharCardNumber) {
      // Check for duplicate if changing
      if (aadharCardNumber !== candidate.aadharCardNumber) {
        const existing = await Candidate.findOne({ aadharCardNumber });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Candidate with this Aadhar card number already exists'
          });
        }
      }
      candidate.aadharCardNumber = aadharCardNumber.trim();
    }
    if (electionCardNumber) {
      // Check for duplicate if changing
      if (electionCardNumber !== candidate.electionCardNumber) {
        const existing = await Candidate.findOne({ electionCardNumber });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Candidate with this Election card number already exists'
          });
        }
      }
      candidate.electionCardNumber = electionCardNumber.trim();
    }
    // Preserve existing photos if not provided (only update if new value is provided)
    // Check if the field exists in request body and has a value
    if ('candidatePhoto' in req.body) {
      if (candidatePhoto && candidatePhoto.trim() !== '') {
        candidate.candidatePhoto = candidatePhoto;
      } else if (candidatePhoto === null || candidatePhoto === '') {
        // Allow clearing the photo if explicitly set to empty
        candidate.candidatePhoto = undefined;
      }
      // If undefined, preserve existing value (don't update)
    }
    if (partyName) candidate.partyName = partyName.trim();
    // Preserve existing party symbol if not provided
    if ('partySymbol' in req.body) {
      if (partySymbol && partySymbol.trim() !== '') {
        candidate.partySymbol = partySymbol;
      } else if (partySymbol === null || partySymbol === '') {
        candidate.partySymbol = undefined;
      }
    }
    // Preserve existing election card photo if not provided
    const { electionCardPhoto } = req.body;
    if ('electionCardPhoto' in req.body) {
      if (electionCardPhoto && electionCardPhoto.trim() !== '') {
        candidate.electionCardPhoto = electionCardPhoto;
      } else if (electionCardPhoto === null || electionCardPhoto === '') {
        candidate.electionCardPhoto = undefined;
      }
    }
    if (contactNumber !== undefined) candidate.contactNumber = contactNumber ? contactNumber.trim() : undefined;
    if (email !== undefined) candidate.email = email ? email.trim().toLowerCase() : undefined;
    if (address !== undefined) candidate.address = address ? address.trim() : undefined;
    if (state !== undefined) candidate.state = state ? state.trim() : undefined;
    if (district !== undefined) candidate.district = district ? district.trim() : undefined;
    if (taluka !== undefined) candidate.taluka = taluka ? taluka.trim() : undefined;
    if (status) candidate.status = status;
    if (notes !== undefined) candidate.notes = notes ? notes.trim() : undefined;

    await candidate.save();

    res.json({
      success: true,
      message: 'Candidate updated successfully',
      data: { candidate }
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate field value. Please check your input.'
      });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete candidate
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Check if candidate is assigned to any elections
    const elections = await Election.find({
      'candidates.candidateId': candidate._id
    });

    if (elections.length > 0) {
      // Check if all elections are completed
      const nonCompletedElections = elections.filter(e => e.status !== 'completed');
      
      if (nonCompletedElections.length > 0) {
        const statusList = nonCompletedElections.map(e => e.status).join(', ');
        return res.status(400).json({
          success: false,
          message: `Cannot delete candidate. Candidate is assigned to ${nonCompletedElections.length} election(s) that are not completed (${statusList}). Only candidates in completed elections can be deleted.`
        });
      }

      // All elections are completed, remove candidate from all elections first
      for (const election of elections) {
        election.candidates = election.candidates.filter(
          c => c.candidateId.toString() !== candidate._id.toString()
        );
        await election.save();
      }
    }

    // Also clear assignedElections from candidate before deletion
    if (candidate.assignedElections && candidate.assignedElections.length > 0) {
      candidate.assignedElections = [];
      await candidate.save();
    }

    // Now delete the candidate
    await Candidate.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Check if candidate is assigned to elections
router.get('/:id/assignments', authenticateAdmin, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const elections = await Election.find({
      'candidates.candidateId': candidate._id
    })
    .select('title status votingStartDate votingEndDate')
    .populate('createdBy', 'fullName')
    .lean();

    res.json({
      success: true,
      data: {
        candidateId: candidate._id,
        candidateName: candidate.name,
        isAssigned: elections.length > 0,
        assignedElections: elections,
        totalAssignments: elections.length
      }
    });
  } catch (error) {
    console.error('Get candidate assignments error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;

