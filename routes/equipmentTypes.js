const express = require('express');
const router = express.Router();
const EquipmentType = require('../models/EquipmentType');
const auth = require('../utils/auth');

// Default equipment types to initialize if database is empty
const defaultEquipmentTypes = [
  "CT (current Transformer)",
  "PT (potential transformer)",
  "CB (circuit breaker)",
  "LA (lightening arrester)",
  "Isolators",
  "CVT(capacitive voltage t/f)",
  "Control & Relay panel",
  "Surge Monitor",
  "Energy Meter"
];

// Initialize default equipment types if none exist
async function initializeDefaultEquipmentTypes() {
  try {
    const count = await EquipmentType.countDocuments();
    if (count === 0) {
      const equipmentTypesToInsert = defaultEquipmentTypes.map(name => ({ name }));
      await EquipmentType.insertMany(equipmentTypesToInsert);
      console.log('Default equipment types initialized');
    }
  } catch (error) {
    console.error('Error initializing default equipment types:', error);
  }
}

// GET /api/equipment-types - Get all equipment types
router.get('/', auth, async (req, res) => {
  try {
    // Initialize default equipment types if needed
    await initializeDefaultEquipmentTypes();
    
    const equipmentTypes = await EquipmentType.find({}).sort({ name: 1 });
    const equipmentTypeNames = equipmentTypes.map(type => type.name);
    
    res.json({
      success: true,
      data: equipmentTypeNames
    });
  } catch (error) {
    console.error('Error fetching equipment types:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching equipment types'
    });
  }
});

// POST /api/equipment-types - Add new equipment type
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Equipment type name is required'
      });
    }

    const trimmedName = name.trim();

    // Check if equipment type already exists
    const existingEquipmentType = await EquipmentType.findOne({ name: trimmedName });
    if (existingEquipmentType) {
      return res.status(400).json({
        success: false,
        message: 'Equipment type already exists'
      });
    }

    // Create new equipment type
    const newEquipmentType = new EquipmentType({ name: trimmedName });
    await newEquipmentType.save();

    // Return all equipment types
    const allEquipmentTypes = await EquipmentType.find({}).sort({ name: 1 });
    const equipmentTypeNames = allEquipmentTypes.map(type => type.name);

    res.status(201).json({
      success: true,
      message: 'Equipment type added successfully',
      data: equipmentTypeNames
    });
  } catch (error) {
    console.error('Error adding equipment type:', error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Equipment type already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error while adding equipment type'
      });
    }
  }
});

// DELETE /api/equipment-types/:id - Delete equipment type (optional for admin use)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEquipmentType = await EquipmentType.findByIdAndDelete(id);

    if (!deletedEquipmentType) {
      return res.status(404).json({
        success: false,
        message: 'Equipment type not found'
      });
    }

    // Return updated list
    const allEquipmentTypes = await EquipmentType.find({}).sort({ name: 1 });
    const equipmentTypeNames = allEquipmentTypes.map(type => type.name);

    res.json({
      success: true,
      message: 'Equipment type deleted successfully',
      data: equipmentTypeNames
    });
  } catch (error) {
    console.error('Error deleting equipment type:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting equipment type'
    });
  }
});

module.exports = router;