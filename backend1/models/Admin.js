const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  mobile: { type: String, trim: true }
}, { timestamps: true });

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.getPublicProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexes
adminSchema.index({ email: 1 });

module.exports = mongoose.model('Admin', adminSchema);


