const express = require('express');
const { query, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'sent', 'failed', 'cancelled']).withMessage('Invalid status'),
  query('type').optional().isIn(['task-start', 'task-reminder', 'task-due', 'task-overdue', 'task-completed']).withMessage('Invalid type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      status,
      type
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (status) filter.status = status;
    if (type) filter.type = type;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const notifications = await Notification.find(filter)
      .populate('task', 'title status priority category')
      .sort({ scheduledFor: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);

    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalNotifications: total,
        hasNext: skip + notifications.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentNotifications = await Notification.find({ user: req.user._id })
      .populate('task', 'title status')
      .sort({ scheduledFor: -1 })
      .limit(5);

    res.json({
      statusStats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      typeStats: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      recentNotifications
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ message: 'Server error while fetching notification stats' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error while deleting notification' });
  }
});

// @route   PUT /api/notifications/:id/cancel
// @desc    Cancel pending notification
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      status: 'pending'
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or cannot be cancelled' });
    }

    notification.status = 'cancelled';
    await notification.save();

    res.json({ message: 'Notification cancelled successfully' });
  } catch (error) {
    console.error('Cancel notification error:', error);
    res.status(500).json({ message: 'Server error while cancelling notification' });
  }
});

module.exports = router;



