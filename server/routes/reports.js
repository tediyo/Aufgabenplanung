const express = require('express');
const { query, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', auth, [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate } = req.query;
    const filter = { user: req.user._id };

    // Add date filter if provided
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // Get all tasks for the user
    const tasks = await Task.find(filter);

    // Calculate basic statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const todoTasks = tasks.filter(task => task.status === 'todo').length;
    const cancelledTasks = tasks.filter(task => task.status === 'cancelled').length;

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate overdue tasks
    const overdueTasks = tasks.filter(task => 
      task.status !== 'done' && 
      task.status !== 'cancelled' && 
      new Date() > task.endDate
    ).length;

    // Calculate total estimated vs actual hours
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    // Tasks by category
    const tasksByCategory = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});

    // Tasks by priority
    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    // Tasks by status
    const tasksByStatus = {
      todo: todoTasks,
      'in-progress': inProgressTasks,
      done: completedTasks,
      cancelled: cancelledTasks
    };

    // Tasks by time frame
    const tasksByTimeFrame = tasks.reduce((acc, task) => {
      acc[task.timeFrame] = (acc[task.timeFrame] || 0) + 1;
      return acc;
    }, {});

    // Recent tasks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTasks = tasks.filter(task => task.createdAt >= sevenDaysAgo).length;

    // Upcoming tasks (next 7 days)
    const nextSevenDays = new Date();
    nextSevenDays.setDate(nextSevenDays.getDate() + 7);
    const upcomingTasks = tasks.filter(task => 
      task.startDate <= nextSevenDays && 
      task.startDate >= new Date() &&
      task.status !== 'done' &&
      task.status !== 'cancelled'
    ).length;

    // Productivity score (based on completion rate and time accuracy)
    const timeAccuracy = totalEstimatedHours > 0 ? 
      Math.max(0, 100 - Math.abs(totalActualHours - totalEstimatedHours) / totalEstimatedHours * 100) : 100;
    const productivityScore = (completionRate + timeAccuracy) / 2;

    res.json({
      overview: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        cancelledTasks,
        overdueTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        productivityScore: Math.round(productivityScore * 100) / 100
      },
      timeTracking: {
        totalEstimatedHours: Math.round(totalEstimatedHours * 100) / 100,
        totalActualHours: Math.round(totalActualHours * 100) / 100,
        timeAccuracy: Math.round(timeAccuracy * 100) / 100
      },
      distribution: {
        byCategory: tasksByCategory,
        byPriority: tasksByPriority,
        byStatus: tasksByStatus,
        byTimeFrame: tasksByTimeFrame
      },
      trends: {
        recentTasks,
        upcomingTasks
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error while generating dashboard analytics' });
  }
});

// @route   GET /api/reports/productivity
// @desc    Get productivity analytics
// @access  Private
router.get('/productivity', auth, [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = 'month', startDate, endDate } = req.query;
    
    // Calculate date range based on period
    let dateRange = {};
    if (startDate && endDate) {
      dateRange = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      const now = new Date();
      switch (period) {
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateRange = { $gte: weekAgo, $lte: now };
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          dateRange = { $gte: monthAgo, $lte: now };
          break;
        case 'quarter':
          const quarterAgo = new Date(now);
          quarterAgo.setMonth(quarterAgo.getMonth() - 3);
          dateRange = { $gte: quarterAgo, $lte: now };
          break;
        case 'year':
          const yearAgo = new Date(now);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          dateRange = { $gte: yearAgo, $lte: now };
          break;
      }
    }

    const filter = { 
      user: req.user._id,
      createdAt: dateRange
    };

    const tasks = await Task.find(filter);

    // Calculate daily productivity metrics
    const dailyMetrics = {};
    tasks.forEach(task => {
      const date = task.createdAt.toISOString().split('T')[0];
      if (!dailyMetrics[date]) {
        dailyMetrics[date] = {
          tasksCreated: 0,
          tasksCompleted: 0,
          hoursWorked: 0,
          completionRate: 0
        };
      }
      
      dailyMetrics[date].tasksCreated++;
      if (task.status === 'done') {
        dailyMetrics[date].tasksCompleted++;
      }
      dailyMetrics[date].hoursWorked += task.actualHours || 0;
    });

    // Calculate completion rates for each day
    Object.keys(dailyMetrics).forEach(date => {
      const metrics = dailyMetrics[date];
      metrics.completionRate = metrics.tasksCreated > 0 ? 
        (metrics.tasksCompleted / metrics.tasksCreated) * 100 : 0;
    });

    // Calculate weekly trends
    const weeklyTrends = {};
    tasks.forEach(task => {
      const weekStart = new Date(task.createdAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyTrends[weekKey]) {
        weeklyTrends[weekKey] = {
          tasksCreated: 0,
          tasksCompleted: 0,
          totalHours: 0,
          categories: {},
          priorities: {}
        };
      }
      
      weeklyTrends[weekKey].tasksCreated++;
      if (task.status === 'done') {
        weeklyTrends[weekKey].tasksCompleted++;
      }
      weeklyTrends[weekKey].totalHours += task.actualHours || 0;
      
      // Track by category
      weeklyTrends[weekKey].categories[task.category] = 
        (weeklyTrends[weekKey].categories[task.category] || 0) + 1;
      
      // Track by priority
      weeklyTrends[weekKey].priorities[task.priority] = 
        (weeklyTrends[weekKey].priorities[task.priority] || 0) + 1;
    });

    // Calculate average metrics
    const totalDays = Object.keys(dailyMetrics).length;
    const avgTasksPerDay = totalDays > 0 ? 
      tasks.length / totalDays : 0;
    const avgCompletionRate = totalDays > 0 ? 
      Object.values(dailyMetrics).reduce((sum, day) => sum + day.completionRate, 0) / totalDays : 0;
    const avgHoursPerDay = totalDays > 0 ? 
      Object.values(dailyMetrics).reduce((sum, day) => sum + day.hoursWorked, 0) / totalDays : 0;

    res.json({
      period,
      dateRange,
      dailyMetrics,
      weeklyTrends,
      averages: {
        tasksPerDay: Math.round(avgTasksPerDay * 100) / 100,
        completionRate: Math.round(avgCompletionRate * 100) / 100,
        hoursPerDay: Math.round(avgHoursPerDay * 100) / 100
      },
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length
    });
  } catch (error) {
    console.error('Productivity analytics error:', error);
    res.status(500).json({ message: 'Server error while generating productivity analytics' });
  }
});

// @route   GET /api/reports/export
// @desc    Export tasks data
// @access  Private
router.get('/export', auth, [
  query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { format = 'json', startDate, endDate } = req.query;
    const filter = { user: req.user._id };

    // Add date filter if provided
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV
      const csvHeader = 'Title,Description,Category,Priority,Status,Start Date,End Date,Estimated Hours,Actual Hours,Progress,Created At\n';
      const csvData = tasks.map(task => 
        `"${task.title}","${task.description || ''}","${task.category}","${task.priority}","${task.status}","${task.startDate.toISOString().split('T')[0]}","${task.endDate.toISOString().split('T')[0]}","${task.estimatedHours}","${task.actualHours}","${task.progress}","${task.createdAt.toISOString()}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=tasks-export.csv');
      res.send(csvHeader + csvData);
    } else {
      // Return JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=tasks-export.json');
      res.json({
        exportDate: new Date().toISOString(),
        totalTasks: tasks.length,
        tasks: tasks.map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          status: task.status,
          timeFrame: task.timeFrame,
          startDate: task.startDate,
          endDate: task.endDate,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          progress: task.progress,
          tags: task.tags,
          isRecurring: task.isRecurring,
          template: task.template,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }))
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error while exporting data' });
  }
});

module.exports = router;



