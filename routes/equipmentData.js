const express = require('express');
const router = express.Router();
const EquipmentData = require('../models/EquipmentData');
const auth = require('../utils/auth');

// GET /api/equipment-data - Get all equipment data for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const equipmentData = await EquipmentData.find({ userId: req.user.id })
      .sort({ updatedAt: -1 }); // Most recently updated first
    
    res.json({
      success: true,
      data: equipmentData
    });
  } catch (error) {
    console.error('Error fetching equipment data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching equipment data'
    });
  }
});

// POST /api/equipment-data - Create new equipment data entry
router.post('/', auth, async (req, res) => {
  try {
    const { feeder, equipment, phase, tableData } = req.body;

    // Validation
    if (!feeder || !equipment || !tableData) {
      return res.status(400).json({
        success: false,
        message: 'Feeder, equipment, and table data are required'
      });
    }

    const newEquipmentData = new EquipmentData({
      userId: req.user.id,
      feeder,
      equipment,
      phase,
      tableData
    });

    const savedData = await newEquipmentData.save();

    res.status(201).json({
      success: true,
      message: 'Equipment data saved successfully',
      data: savedData
    });
  } catch (error) {
    console.error('Error saving equipment data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving equipment data'
    });
  }
});

// PUT /api/equipment-data/:id - Update existing equipment data entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { feeder, equipment, phase, tableData } = req.body;
    const { id } = req.params;

    // Validation
    if (!feeder || !equipment || !tableData) {
      return res.status(400).json({
        success: false,
        message: 'Feeder, equipment, and table data are required'
      });
    }

    const updatedData = await EquipmentData.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { feeder, equipment, phase, tableData, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: 'Equipment data not found or you do not have permission to update it'
      });
    }

    res.json({
      success: true,
      message: 'Equipment data updated successfully',
      data: updatedData
    });
  } catch (error) {
    console.error('Error updating equipment data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating equipment data'
    });
  }
});

// DELETE /api/equipment-data/:id - Delete equipment data entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedData = await EquipmentData.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!deletedData) {
      return res.status(404).json({
        success: false,
        message: 'Equipment data not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Equipment data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting equipment data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting equipment data'
    });
  }
});

// POST /api/equipment-data/:id/duplicate - Duplicate an equipment data entry
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const originalData = await EquipmentData.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!originalData) {
      return res.status(404).json({
        success: false,
        message: 'Equipment data not found or you do not have permission to access it'
      });
    }

    // Create a duplicate without the _id and timestamps
    const duplicateData = new EquipmentData({
      userId: req.user.id,
      feeder: originalData.feeder,
      equipment: originalData.equipment,
      phase: originalData.phase,
      tableData: originalData.tableData
    });

    const savedDuplicate = await duplicateData.save();

    res.status(201).json({
      success: true,
      message: 'Equipment data duplicated successfully',
      data: savedDuplicate
    });
  } catch (error) {
    console.error('Error duplicating equipment data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while duplicating equipment data'
    });
  }
});

// GET /api/equipment-data/:id - Get specific equipment data entry
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const equipmentData = await EquipmentData.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!equipmentData) {
      return res.status(404).json({
        success: false,
        message: 'Equipment data not found or you do not have permission to access it'
      });
    }

    res.json({
      success: true,
      data: equipmentData
    });
  } catch (error) {
    console.error('Error fetching equipment data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching equipment data'
    });
  }
});

module.exports = router;