const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Election title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Election description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Election type is required'],
    enum: [
      'Lok Sabha',           // General Elections for Parliament
      'Rajya Sabha',        // Upper House Elections
      'State Assembly',     // State Legislative Assembly
      'Municipal Corporation', // Municipal Elections
      'Panchayat',          // Village Council Elections
      'Zila Parishad',      // District Council Elections
      'Block Development',  // Block Level Elections
      'Mayor',              // Mayoral Elections
      'Other'               // Other types
    ]
  },
  level: {
    type: String,
    required: [true, 'Election level is required'],
    enum: ['National', 'State', 'District', 'Municipal', 'Village', 'Block']
  },
  panchayatName: {
    type: String,
    trim: true,
    maxlength: [100, 'Panchayat name cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: function() {
      return this.level !== 'National';
    },
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  district: {
    type: String,
    trim: true,
    maxlength: [50, 'District name cannot exceed 50 characters']
  },
  taluka: {
    type: String,
    trim: true,
    maxlength: [50, 'Taluka name cannot exceed 50 characters']
  },
  villageCity: {
    type: String,
    trim: true,
    maxlength: [100, 'Village/City name cannot exceed 100 characters']
  },
  constituency: {
    type: String,
    trim: true,
    maxlength: [100, 'Constituency name cannot exceed 100 characters']
  },
  votingStartDate: {
    type: Date,
    required: [true, 'Voting start date is required'],
    validate: {
      validator: function(value) {
        // Allow saving when election is already active/completed/cancelled/postponed
        // Strict future constraint only for draft/upcoming/new records
        const exemptStatuses = ['active', 'completed', 'cancelled', 'postponed'];
        if (!this.isNew && exemptStatuses.includes(this.status)) {
          return true;
        }
        return value > new Date();
      },
      message: 'Voting start date must be in the future'
    }
  },
  votingEndDate: {
    type: Date,
    required: [true, 'Voting end date is required'],
    validate: {
      validator: function(value) {
        return value > this.votingStartDate;
      },
      message: 'Voting end date must be after start date'
    }
  },
  resultDeclarationDate: {
    type: Date,
    required: [true, 'Result declaration date is required'],
    validate: {
      validator: function(value) {
        return value >= this.votingEndDate;
      },
      message: 'Result declaration date must be on or after voting end date'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled', 'postponed'],
    default: 'draft'
  },
  totalVoters: {
    type: Number,
    default: 0,
    min: [0, 'Total voters cannot be negative']
  },
  totalVotesCast: {
    type: Number,
    default: 0,
    min: [0, 'Total votes cast cannot be negative']
  },
  turnoutPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Turnout percentage cannot be negative'],
    max: [100, 'Turnout percentage cannot exceed 100']
  },
  candidates: [{
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true
    },
    party: {
      type: String,
      trim: true,
      maxlength: [100, 'Party name cannot exceed 100 characters']
    },
    symbol: {
      type: String,
      trim: true
    },
    votes: {
      type: Number,
      default: 0,
      min: [0, 'Votes cannot be negative']
    },
    votePercentage: {
      type: Number,
      default: 0,
      min: [0, 'Vote percentage cannot be negative'],
      max: [100, 'Vote percentage cannot exceed 100']
    }
  }],
  results: {
    winner: {
      candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
      },
      votes: Number,
      percentage: Number
    },
    isDeclared: {
      type: Boolean,
      default: false
    },
    declaredAt: Date
  },
  eligibilityCriteria: {
    minAge: {
      type: Number,
      default: 18,
      min: [18, 'Minimum age cannot be less than 18']
    },
    maxAge: {
      type: Number,
      min: [18, 'Maximum age cannot be less than 18']
    },
    requiredDocuments: [{
      type: String,
      enum: ['Voter ID', 'Aadhaar Card', 'PAN Card', 'Driving License', 'Passport']
    }],
    residencyRequirement: {
      type: String,
      enum: ['None', '6 months', '1 year', '2 years', '5 years'],
      default: 'None'
    }
  },
  security: {
    isSecretBallot: {
      type: Boolean,
      default: true
    },
    allowProxyVoting: {
      type: Boolean,
      default: false
    },
    allowPostalVoting: {
      type: Boolean,
      default: false
    },
    requireBiometric: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  archived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
electionSchema.index({ type: 1, status: 1 });
electionSchema.index({ state: 1, district: 1, taluka: 1 });
electionSchema.index({ votingStartDate: 1, votingEndDate: 1 });
electionSchema.index({ createdBy: 1 });
electionSchema.index({ isActive: 1 });

// Virtual for voting duration in days
electionSchema.virtual('votingDuration').get(function() {
  if (this.votingStartDate && this.votingEndDate) {
    return Math.ceil((this.votingEndDate - this.votingStartDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for days until voting starts
electionSchema.virtual('daysUntilVoting').get(function() {
  if (this.votingStartDate) {
    const now = new Date();
    const diffTime = this.votingStartDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for days until results
electionSchema.virtual('daysUntilResults').get(function() {
  if (this.resultDeclarationDate) {
    const now = new Date();
    const diffTime = this.resultDeclarationDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Method to check if election is currently active
electionSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.votingStartDate <= now && 
         this.votingEndDate >= now;
};

// Method to check if voting is open
electionSchema.methods.isVotingOpen = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.votingStartDate <= now && 
         this.votingEndDate >= now;
};

// Method to check if results can be declared
electionSchema.methods.canDeclareResults = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.votingEndDate <= now && 
         this.resultDeclarationDate <= now;
};

// Method to calculate turnout percentage
electionSchema.methods.calculateTurnout = function() {
  if (this.totalVoters > 0) {
    this.turnoutPercentage = Math.round((this.totalVotesCast / this.totalVoters) * 100 * 100) / 100;
  }
  return this.turnoutPercentage;
};

// Method to update candidate vote percentages
electionSchema.methods.updateCandidatePercentages = function() {
  if (this.totalVotesCast > 0) {
    this.candidates.forEach(candidate => {
      candidate.votePercentage = Math.round((candidate.votes / this.totalVotesCast) * 100 * 100) / 100;
    });
  }
};

// Method to declare winner
electionSchema.methods.declareWinner = function() {
  if (this.candidates.length === 0) return null;
  
  const winner = this.candidates.reduce((prev, current) => 
    (prev.votes > current.votes) ? prev : current
  );
  
  this.results = {
    winner: {
      candidateId: winner.candidateId,
      votes: winner.votes,
      percentage: winner.votePercentage
    },
    isDeclared: true,
    declaredAt: new Date()
  };
  
  this.status = 'completed';
  return winner;
};

// Pre-save middleware to update status based on dates
electionSchema.pre('save', function(next) {
  const now = new Date();
  
  if ((this.status === 'upcoming' || this.status === 'draft') && this.votingStartDate <= now) {
    this.status = 'active';
  }
  
  if (this.status === 'active' && this.votingEndDate < now) {
    this.status = 'completed';
  }
  
  // Calculate turnout if votes have been cast
  if (this.totalVotesCast > 0) {
    this.calculateTurnout();
    this.updateCandidatePercentages();
  }
  
  next();
});

module.exports = mongoose.model('Election', electionSchema);
