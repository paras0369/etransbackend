const mongoose = require('mongoose');

const feederSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a unique index on name to prevent duplicates
feederSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Feeder', feederSchema);