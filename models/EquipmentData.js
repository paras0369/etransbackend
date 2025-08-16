const mongoose = require('mongoose');

const tableCellSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const tableRowSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  cells: [tableCellSchema]
});

const equipmentDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feeder: {
    type: String,
    required: true
  },
  equipment: {
    type: String,
    required: true
  },
  phase: {
    type: String,
    required: false
  },
  tableData: [tableRowSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
equipmentDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EquipmentData', equipmentDataSchema);