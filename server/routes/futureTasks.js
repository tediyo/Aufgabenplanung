const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const FutureTask = require('../models/FutureTask');
const { auth } = require('../middleware/auth');

// Get all future tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const futureTasks = await FutureTask.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ futureTasks });
  } catch (error) {
    console.error('Error fetching future tasks:', error);
    res.status(500).json({ message: 'Server error while fetching future tasks' });
  }
});

// Create a new future task
router.post('/', auth, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task name must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('category')
    .optional()
    .isIn(['personal', 'work', 'health', 'education', 'finance', 'other'])
    .withMessage('Invalid category'),
  body('estimatedDate')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Allow empty values
      }
      return new Date(value).toString() !== 'Invalid Date';
    })
    .withMessage('Estimated date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, priority, category, estimatedDate } = req.body;

    const futureTask = new FutureTask({
      name,
      description,
      priority,
      category,
      estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
      user: req.user._id
    });

    await futureTask.save();
    res.status(201).json({ message: 'Future task created successfully', futureTask });
  } catch (error) {
    console.error('Error creating future task:', error);
    res.status(500).json({ message: 'Server error while creating future task' });
  }
});

// Update a future task
router.put('/:id', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task name must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('category')
    .optional()
    .isIn(['personal', 'work', 'health', 'education', 'finance', 'other'])
    .withMessage('Invalid category'),
  body('estimatedDate')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Allow empty values
      }
      return new Date(value).toString() !== 'Invalid Date';
    })
    .withMessage('Estimated date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, priority, category, estimatedDate, isCompleted } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (estimatedDate !== undefined) updateData.estimatedDate = estimatedDate ? new Date(estimatedDate) : null;
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      updateData.completedAt = isCompleted ? new Date() : null;
    }

    const futureTask = await FutureTask.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!futureTask) {
      return res.status(404).json({ message: 'Future task not found' });
    }

    res.json({ message: 'Future task updated successfully', futureTask });
  } catch (error) {
    console.error('Error updating future task:', error);
    res.status(500).json({ message: 'Server error while updating future task' });
  }
});

// Delete a future task
router.delete('/:id', auth, async (req, res) => {
  try {
    const futureTask = await FutureTask.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!futureTask) {
      return res.status(404).json({ message: 'Future task not found' });
    }

    res.json({ message: 'Future task deleted successfully' });
  } catch (error) {
    console.error('Error deleting future task:', error);
    res.status(500).json({ message: 'Server error while deleting future task' });
  }
});

// Toggle completion status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const futureTask = await FutureTask.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!futureTask) {
      return res.status(404).json({ message: 'Future task not found' });
    }

    futureTask.isCompleted = !futureTask.isCompleted;
    futureTask.completedAt = futureTask.isCompleted ? new Date() : null;
    
    await futureTask.save();
    res.json({ message: 'Future task status updated', futureTask });
  } catch (error) {
    console.error('Error toggling future task:', error);
    res.status(500).json({ message: 'Server error while updating future task' });
  }
});

module.exports = router;
