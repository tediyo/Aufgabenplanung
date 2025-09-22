const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { 
  createTaskNotifications, 
  sendImmediateTaskCreationNotification, 
  updateTaskNotifications 
} = require('../utils/notificationUtils');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for user with filtering and pagination
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['todo', 'in-progress', 'done', 'cancelled']).withMessage('Invalid status'),
  query('category').optional().isIn(['work', 'personal', 'health', 'finance', 'education', 'other']).withMessage('Invalid category'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('timeFrame').optional().isIn(['daily', 'weekly', 'monthly', 'annually', 'custom']).withMessage('Invalid time frame'),
  query('sortBy').optional().isIn(['createdAt', 'startDate', 'endDate', 'priority', 'title']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
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
      category,
      priority,
      timeFrame,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (timeFrame) filter.timeFrame = timeFrame;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('parentTask', 'title')
      .populate('subtasks', 'title status progress');

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTasks: total,
        hasNext: skip + tasks.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id })
      .populate('parentTask', 'title status')
      .populate('subtasks', 'title status progress startDate endDate');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').isIn(['work', 'personal', 'health', 'finance', 'education', 'other']).withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('timeFrame').isIn(['daily', 'weekly', 'monthly', 'annually', 'custom']).withMessage('Invalid time frame'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
  body('estimatedHours').optional().isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
  body('template').optional().isIn(['daily-workout', 'weekly-review', 'monthly-budget', 'annual-goal', 'custom']).withMessage('Invalid template')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      priority,
      timeFrame,
      startDate,
      endDate,
      estimatedHours = 0,
      tags = [],
      isRecurring = false,
      recurringPattern,
      template = 'custom',
      notifications = {},
      parentTask
    } = req.body;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Create task
    const task = new Task({
      title,
      description,
      category,
      priority,
      timeFrame,
      startDate: start,
      endDate: end,
      estimatedHours,
      tags,
      isRecurring,
      recurringPattern,
      template,
      notifications: {
        startDate: notifications.startDate !== false,
        endDate: notifications.endDate !== false,
        reminder: notifications.reminder !== false,
        reminderDays: notifications.reminderDays || 1
      },
      user: req.user._id,
      parentTask
    });

    await task.save();

    // Send immediate task creation notification (non-blocking)
    sendImmediateTaskCreationNotification(task, req.user).catch(error => {
      console.error('Failed to send task creation notification:', error);
    });

    // Create scheduled notifications for the task (non-blocking)
    createTaskNotifications(task, req.user).catch(error => {
      console.error('Failed to create task notifications:', error);
    });

    // If this is a subtask, add it to parent task
    if (parentTask) {
      await Task.findByIdAndUpdate(parentTask, {
        $push: { subtasks: task._id }
      });
    }

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').optional().isIn(['work', 'personal', 'health', 'finance', 'education', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['todo', 'in-progress', 'done', 'cancelled']).withMessage('Invalid status'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('progress').optional().isFloat({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('estimatedHours').optional().isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    const allowedUpdates = [
      'title', 'description', 'category', 'priority', 'status',
      'startDate', 'endDate', 'progress', 'estimatedHours', 'tags',
      'notifications', 'recurringPattern'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    // Auto-update status based on progress
    if (req.body.progress !== undefined) {
      if (req.body.progress === 100) {
        task.status = 'done';
      } else if (req.body.progress > 0) {
        task.status = 'in-progress';
      }
    }

    await task.save();

    // Update notifications based on changes
    await updateTaskNotifications(req.params.id, req.body);

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskTitle = task.title;
    const isRecurring = task.isRecurring;

    // Delete associated notifications
    const deletedNotifications = await Notification.deleteMany({ task: task._id });
    console.log(`Deleted ${deletedNotifications.deletedCount} notifications for task: ${taskTitle}`);

    // Remove from parent task if it's a subtask
    if (task.parentTask) {
      await Task.findByIdAndUpdate(task.parentTask, {
        $pull: { subtasks: task._id }
      });
      console.log(`Removed subtask ${taskTitle} from parent task`);
    }

    // Delete subtasks (cascade delete)
    const deletedSubtasks = await Task.deleteMany({ parentTask: task._id });
    if (deletedSubtasks.deletedCount > 0) {
      console.log(`Deleted ${deletedSubtasks.deletedCount} subtasks for task: ${taskTitle}`);
    }

    // Delete the main task
    await Task.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Task deleted successfully',
      deletedTask: {
        title: taskTitle,
        isRecurring: isRecurring,
        subtasksDeleted: deletedSubtasks.deletedCount,
        notificationsDeleted: deletedNotifications.deletedCount
      }
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

// @route   DELETE /api/tasks/bulk
// @desc    Delete multiple tasks
// @access  Private
router.delete('/bulk', auth, [
  body('taskIds').isArray({ min: 1 }).withMessage('Task IDs array is required'),
  body('taskIds.*').isMongoId().withMessage('Invalid task ID format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskIds } = req.body;

    // Find all tasks belonging to the user
    const tasks = await Task.find({ 
      _id: { $in: taskIds }, 
      user: req.user._id 
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found' });
    }

    const taskTitles = tasks.map(task => task.title);
    let totalSubtasksDeleted = 0;
    let totalNotificationsDeleted = 0;

    // Delete each task and its associated data
    for (const task of tasks) {
    // Delete associated notifications
      const deletedNotifications = await Notification.deleteMany({ task: task._id });
      totalNotificationsDeleted += deletedNotifications.deletedCount;

    // Remove from parent task if it's a subtask
    if (task.parentTask) {
      await Task.findByIdAndUpdate(task.parentTask, {
        $pull: { subtasks: task._id }
      });
    }

    // Delete subtasks
      const deletedSubtasks = await Task.deleteMany({ parentTask: task._id });
      totalSubtasksDeleted += deletedSubtasks.deletedCount;
    }

    // Delete all tasks
    const deletedTasks = await Task.deleteMany({ 
      _id: { $in: taskIds }, 
      user: req.user._id 
    });

    res.json({
      message: 'Tasks deleted successfully',
      deletedTasks: {
        count: deletedTasks.deletedCount,
        titles: taskTitles,
        subtasksDeleted: totalSubtasksDeleted,
        notificationsDeleted: totalNotificationsDeleted
      }
    });
  } catch (error) {
    console.error('Bulk delete tasks error:', error);
    res.status(500).json({ message: 'Server error while deleting tasks' });
  }
});

// @route   DELETE /api/tasks/cleanup/completed
// @desc    Delete all completed tasks
// @access  Private
router.delete('/cleanup/completed', auth, async (req, res) => {
  try {
    // Find all completed tasks for the user
    const completedTasks = await Task.find({ 
      user: req.user._id, 
      status: 'done' 
    });

    if (completedTasks.length === 0) {
      return res.json({ 
        message: 'No completed tasks found to delete',
        deletedCount: 0
      });
    }

    const taskIds = completedTasks.map(task => task._id);
    let totalNotificationsDeleted = 0;

    // Delete associated notifications
    for (const taskId of taskIds) {
      const deletedNotifications = await Notification.deleteMany({ task: taskId });
      totalNotificationsDeleted += deletedNotifications.deletedCount;
    }

    // Delete all completed tasks
    const deletedTasks = await Task.deleteMany({ 
      _id: { $in: taskIds }, 
      user: req.user._id 
    });

    res.json({
      message: 'Completed tasks deleted successfully',
      deletedTasks: {
        count: deletedTasks.deletedCount,
        notificationsDeleted: totalNotificationsDeleted
      }
    });
  } catch (error) {
    console.error('Cleanup completed tasks error:', error);
    res.status(500).json({ message: 'Server error while cleaning up completed tasks' });
  }
});

// @route   DELETE /api/tasks/cleanup/old
// @desc    Delete old tasks (older than specified days)
// @access  Private
router.delete('/cleanup/old', auth, [
  query('days').isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const days = parseInt(req.query.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Find old tasks for the user
    const oldTasks = await Task.find({ 
      user: req.user._id,
      createdAt: { $lt: cutoffDate },
      status: { $in: ['todo', 'in-progress'] } // Only delete non-completed old tasks
    });

    if (oldTasks.length === 0) {
      return res.json({ 
        message: `No old tasks found (older than ${days} days)`,
        deletedCount: 0
      });
    }

    const taskIds = oldTasks.map(task => task._id);
    let totalNotificationsDeleted = 0;

    // Delete associated notifications
    for (const taskId of taskIds) {
      const deletedNotifications = await Notification.deleteMany({ task: taskId });
      totalNotificationsDeleted += deletedNotifications.deletedCount;
    }

    // Delete old tasks
    const deletedTasks = await Task.deleteMany({ 
      _id: { $in: taskIds }, 
      user: req.user._id 
    });

    res.json({
      message: `Old tasks deleted successfully (older than ${days} days)`,
      deletedTasks: {
        count: deletedTasks.deletedCount,
        notificationsDeleted: totalNotificationsDeleted,
        cutoffDate: cutoffDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Cleanup old tasks error:', error);
    res.status(500).json({ message: 'Server error while cleaning up old tasks' });
  }
});

// @route   POST /api/tasks/:id/start-timer
// @desc    Start time tracking for task
// @access  Private
router.post('/:id/start-timer', auth, [
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters')
], async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if there's already an active timer
    const activeTimer = task.timeTracking.find(t => !t.endTime);
    if (activeTimer) {
      return res.status(400).json({ message: 'Timer is already running for this task' });
    }

    await task.startTimeTracking(req.body.description || '');

    res.json({ message: 'Timer started successfully' });
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ message: 'Server error while starting timer' });
  }
});

// @route   POST /api/tasks/:id/stop-timer
// @desc    Stop time tracking for task
// @access  Private
router.post('/:id/stop-timer', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if there's an active timer
    const activeTimer = task.timeTracking.find(t => !t.endTime);
    if (!activeTimer) {
      return res.status(400).json({ message: 'No active timer found for this task' });
    }

    await task.stopTimeTracking();

    res.json({ message: 'Timer stopped successfully' });
  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(500).json({ message: 'Server error while stopping timer' });
  }
});

// @route   GET /api/tasks/templates
// @desc    Get task templates
// @access  Private
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = {
      'daily-workout': {
        title: 'Daily Workout',
        description: 'Complete your daily exercise routine',
        category: 'health',
        priority: 'medium',
        timeFrame: 'daily',
        estimatedHours: 1,
        tags: ['fitness', 'health', 'routine']
      },
      'weekly-review': {
        title: 'Weekly Review',
        description: 'Review your week and plan for the next one',
        category: 'work',
        priority: 'high',
        timeFrame: 'weekly',
        estimatedHours: 2,
        tags: ['planning', 'review', 'productivity']
      },
      'monthly-budget': {
        title: 'Monthly Budget Review',
        description: 'Review and update your monthly budget',
        category: 'finance',
        priority: 'high',
        timeFrame: 'monthly',
        estimatedHours: 1.5,
        tags: ['finance', 'budget', 'planning']
      },
      'annual-goal': {
        title: 'Annual Goal Planning',
        description: 'Set and review your annual goals',
        category: 'personal',
        priority: 'high',
        timeFrame: 'annually',
        estimatedHours: 4,
        tags: ['goals', 'planning', 'personal']
      }
    };

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error while fetching templates' });
  }
});

module.exports = router;


