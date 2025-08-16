const mongoose = require('mongoose');

const equipmentTypeSchema = new mongoose.Schema({
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
equipmentTypeSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('EquipmentType', equipmentTypeSchema);