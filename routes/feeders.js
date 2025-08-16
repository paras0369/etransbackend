const express = require('express');
const router = express.Router();
const Feeder = require('../models/Feeder');
const auth = require('../utils/auth');

// Default feeders to initialize if database is empty
const defaultFeeders = [
  "132kv Auto-1",
  "132kv Chityal", 
  "132kv OCM",
  "132kv Mancherial",
  "132kv Bus Coupler",
  "132kv Bussapur",
  "132kv RTS-2",
  "132kv RTS-3",
  "132kv Railway-1",
  "132kv Railway-2",
  "132kv Yellampalli",
  "132kv Dharmaram",
  "133kv Suglampalli",
  "132kv Durshed-2",
  "132kv Durshed-3",
  "132kv Jagityal",
  "132kv Keshoram",
  "Station Transformers",
  "Batteries & Chargers",
  "Bus PT's"
];

// Initialize default feeders if none exist
async function initializeDefaultFeeders() {
  try {
    const count = await Feeder.countDocuments();
    if (count === 0) {
      const feedersToInsert = defaultFeeders.map(name => ({ name }));
      await Feeder.insertMany(feedersToInsert);
      console.log('Default feeders initialized');
    }
  } catch (error) {
    console.error('Error initializing default feeders:', error);
  }
}

// GET /api/feeders - Get all feeders
router.get('/', auth, async (req, res) => {
  try {
    // Initialize default feeders if needed
    await initializeDefaultFeeders();
    
    const feeders = await Feeder.find({}).sort({ name: 1 });
    const feederNames = feeders.map(feeder => feeder.name);
    
    res.json({
      success: true,
      data: feederNames
    });
  } catch (error) {
    console.error('Error fetching feeders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching feeders'
    });
  }
});

// POST /api/feeders - Add new feeder
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feeder name is required'
      });
    }

    const trimmedName = name.trim();

    // Check if feeder already exists
    const existingFeeder = await Feeder.findOne({ name: trimmedName });
    if (existingFeeder) {
      return res.status(400).json({
        success: false,
        message: 'Feeder already exists'
      });
    }

    // Create new feeder
    const newFeeder = new Feeder({ name: trimmedName });
    await newFeeder.save();

    // Return all feeders
    const allFeeders = await Feeder.find({}).sort({ name: 1 });
    const feederNames = allFeeders.map(feeder => feeder.name);

    res.status(201).json({
      success: true,
      message: 'Feeder added successfully',
      data: feederNames
    });
  } catch (error) {
    console.error('Error adding feeder:', error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Feeder already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error while adding feeder'
      });
    }
  }
});

// DELETE /api/feeders/:id - Delete feeder (optional for admin use)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFeeder = await Feeder.findByIdAndDelete(id);

    if (!deletedFeeder) {
      return res.status(404).json({
        success: false,
        message: 'Feeder not found'
      });
    }

    // Return updated list
    const allFeeders = await Feeder.find({}).sort({ name: 1 });
    const feederNames = allFeeders.map(feeder => feeder.name);

    res.json({
      success: true,
      message: 'Feeder deleted successfully',
      data: feederNames
    });
  } catch (error) {
    console.error('Error deleting feeder:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting feeder'
    });
  }
});

module.exports = router;