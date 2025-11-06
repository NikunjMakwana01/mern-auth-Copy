const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Track how many times user has viewed their vote
  viewCount: {
    type: Number,
    default: 0,
    max: 2
  },
  lastViewedAt: {
    type: Date
  },
  // Store IP address for security (optional)
  ipAddress: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per user per election
voteSchema.index({ electionId: 1, userId: 1 }, { unique: true });

// Index for candidate votes
voteSchema.index({ candidateId: 1 });

module.exports = mongoose.model('Vote', voteSchema);

