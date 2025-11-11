const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');
const electionRoutes = require('./routes/elections');
const candidateRoutes = require('./routes/candidates');
const votingRoutes = require('./routes/voting');
const Election = require('./models/Election');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parser - increased limit for file uploads (base64 images can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/voting', votingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');

  // Background status sweeper: promote upcoming->active at start, active->completed at end
  const sweepStatuses = async () => {
    try {
      const now = new Date();
      
      // Find elections that just became active (status changed from upcoming to active)
      const newlyActiveElections = await Election.find({
        status: { $in: ['draft', 'upcoming'] },
        votingStartDate: { $lte: now }
      });

      // Update status to active
      await Election.updateMany(
        { status: { $in: ['draft', 'upcoming'] }, votingStartDate: { $lte: now } },
        { $set: { status: 'active' } }
      );

      // Automatic email of voting passwords removed; passwords are sent on explicit user request

      // Update completed status
      await Election.updateMany(
        { status: 'active', votingEndDate: { $lt: now } },
        { $set: { status: 'completed' } }
      );
    } catch (err) {
      console.error('Background sweep error:', err.message);
    }
  };
  
  // Run every 60 seconds
  sweepStatuses();
  setInterval(sweepStatuses, 60 * 1000);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});
