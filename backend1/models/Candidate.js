const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  village: {
    type: String,
    required: [true, 'Village is required'],
    trim: true,
    maxlength: [100, 'Village cannot exceed 100 characters']
  },
  aadharCardNumber: {
    type: String,
    required: false,
    trim: true,
    sparse: true, // Allows multiple null values but ensures uniqueness when present
    validate: {
      validator: function(v) {
        // Only validate format if value is provided
        return !v || /^\d{12}$/.test(v);
      },
      message: 'Aadhar card number must be exactly 12 digits'
    }
  },
  electionCardNumber: {
    type: String,
    required: [true, 'Election card number is required'],
    trim: true,
    match: [/^[A-Z]{3}\d{7}$/, 'Election card number must be 3 uppercase letters followed by 7 digits (e.g., NNI1234567)']
  },
  candidatePhoto: {
    type: String,
    trim: true
  },
  partyName: {
    type: String,
    required: [true, 'Party name is required'],
    trim: true,
    maxlength: [100, 'Party name cannot exceed 100 characters']
  },
  partySymbol: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
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
  electionCardPhoto: {
    type: String,
    trim: true
  },
  assignedElections: [{
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true
    },
    electionTitle: {
      type: String,
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
candidateSchema.index({ aadharCardNumber: 1 });
candidateSchema.index({ electionCardNumber: 1 });
candidateSchema.index({ partyName: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ createdBy: 1 });
candidateSchema.index({ isActive: 1 });

// Method to get public profile
candidateSchema.methods.getPublicProfile = function() {
  const candidateObject = this.toObject();
  return candidateObject;
};

module.exports = mongoose.model('Candidate', candidateSchema);

