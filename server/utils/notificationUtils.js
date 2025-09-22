const Notification = require('../models/Notification');
const Task = require('../models/Task');
const User = require('../models/User');
const { 
  sendTaskNotification, 
  sendTaskCreationNotification, 
  sendTaskActionNotification, 
  sendScheduledDateNotification,
  sendWeeklyReport,
  sendMonthlyReport 
} = require('./emailService');

// Send immediate task creation notification
const sendImmediateTaskCreationNotification = async (task, user) => {
  try {
    const result = await sendTaskCreationNotification(task, user);
    if (result.success) {
      console.log(`Task creation notification sent for: ${task.title}`);
    } else {
      console.error(`Failed to send task creation notification: ${result.error}`);
    }
    return result;
  } catch (error) {
    console.error('Error sending task creation notification:', error);
    throw error;
  }
};

// Send task action notification (start/finish)
const sendImmediateTaskActionNotification = async (action, task, user) => {
  try {
    const result = await sendTaskActionNotification(action, task, user);
    if (result.success) {
      console.log(`Task ${action} notification sent for: ${task.title}`);
    } else {
      console.error(`Failed to send task ${action} notification: ${result.error}`);
    }
    return result;
  } catch (error) {
    console.error(`Error sending task ${action} notification:`, error);
    throw error;
  }
};

// Create scheduled notifications for a task
const createTaskNotifications = async (task, user) => {
  try {
    const notifications = [];

    // Start date notification (if task not started by start date)
    if (task.notifications && task.notifications.startDate) {
      notifications.push({
        type: 'task-start-date',
        task: task._id,
        user: user._id,
        email: user.email,
        subject: `Task Start Date: ${task.title}`,
        message: `Your task "${task.title}" is scheduled to start today.`,
        scheduledFor: task.startDate
      });
    }

    // Due date notification (if task not completed by end date)
    if (task.notifications && task.notifications.endDate) {
      notifications.push({
        type: 'task-due-date',
        task: task._id,
        user: user._id,
        email: user.email,
        subject: `Task Due Today: ${task.title}`,
        message: `Your task "${task.title}" is due today.`,
        scheduledFor: task.endDate
      });
    }

    // Create notifications in database
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} scheduled notifications for task: ${task.title}`);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating task notifications:', error);
    throw error;
  }
};

// Process pending notifications
const processPendingNotifications = async () => {
  try {
    const pendingNotifications = await Notification.getPendingNotifications();
    
    for (const notification of pendingNotifications) {
      try {
        let result;
        
        // Handle different notification types
        if (['task-start-date', 'task-due-date'].includes(notification.type)) {
          result = await sendScheduledDateNotification(
            notification.type,
            notification.task,
            { email: notification.email, _id: notification.user }
          );
        } else {
          result = await sendTaskNotification(
            notification.type,
            notification.task,
            { email: notification.email, _id: notification.user }
          );
        }

        if (result.success) {
          await notification.markAsSent();
          console.log(`Notification sent successfully: ${notification.type} for task ${notification.task.title}`);
        } else {
          await notification.markAsFailed(result.error);
          console.error(`Failed to send notification: ${result.error}`);
        }
      } catch (error) {
        await notification.markAsFailed(error.message);
        console.error(`Error processing notification ${notification._id}:`, error);
      }
    }

    return pendingNotifications.length;
  } catch (error) {
    console.error('Error processing pending notifications:', error);
    throw error;
  }
};

// Check for overdue tasks and create overdue notifications
const checkOverdueTasks = async () => {
  try {
    const overdueTasks = await Task.find({
      status: { $nin: ['done', 'cancelled'] },
      endDate: { $lt: new Date() }
    }).populate('user');

    for (const task of overdueTasks) {
      // Check if overdue notification already exists
      const existingNotification = await Notification.findOne({
        task: task._id,
        type: 'task-overdue',
        status: { $in: ['pending', 'sent'] }
      });

      if (!existingNotification) {
        const notification = new Notification({
          type: 'task-overdue',
          task: task._id,
          user: task.user._id,
          email: task.user.email,
          subject: `OVERDUE: ${task.title}`,
          message: `Your task "${task.title}" is overdue.`,
          scheduledFor: new Date()
        });

        await notification.save();
        console.log(`Created overdue notification for task: ${task.title}`);
      }
    }

    return overdueTasks.length;
  } catch (error) {
    console.error('Error checking overdue tasks:', error);
    throw error;
  }
};

// Update notifications when task is updated
const updateTaskNotifications = async (taskId, updates) => {
  try {
    const task = await Task.findById(taskId).populate('user');
    if (!task) return;

    // If dates changed, update or recreate notifications
    if (updates.startDate || updates.endDate) {
      // Delete existing scheduled notifications
      await Notification.deleteMany({
        task: taskId,
        type: { $in: ['task-start-date', 'task-due-date'] }
      });

      // Create new notifications with updated dates
      await createTaskNotifications(task, task.user);
    }

    // If task status changed to in-progress, send starting notification
    if (updates.status === 'in-progress') {
      await sendImmediateTaskActionNotification('start', task, task.user);
    }

    // If task status changed to done, send finishing notification
    if (updates.status === 'done') {
      await sendImmediateTaskActionNotification('finish', task, task.user);
    }
  } catch (error) {
    console.error('Error updating task notifications:', error);
    throw error;
  }
};

// Clean up old notifications
const cleanupOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      status: 'sent',
      sentAt: { $lt: cutoffDate }
    });

    console.log(`Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    throw error;
  }
};

// Generate weekly report data
const generateWeeklyReportData = async (userId) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: userId,
      $or: [
        { createdAt: { $gte: startOfWeek, $lte: endOfWeek } },
        { updatedAt: { $gte: startOfWeek, $lte: endOfWeek } }
      ]
    });

    const doneTasks = tasks.filter(task => task.status === 'done');
    const remainingTasks = tasks.filter(task => task.status === 'in-progress');
    const todoTasks = tasks.filter(task => task.status === 'todo');

    const weekRange = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;

    return {
      weekRange,
      doneTasks: doneTasks.length,
      remainingTasks: remainingTasks.length,
      todoTasks: todoTasks.length,
      doneTasksList: doneTasks.map(task => ({ title: task.title, category: task.category })),
      remainingTasksList: remainingTasks.map(task => ({ title: task.title, category: task.category, progress: task.progress || 0 })),
      todoTasksList: todoTasks.map(task => ({ title: task.title, category: task.category, endDate: task.endDate }))
    };
  } catch (error) {
    console.error('Error generating weekly report data:', error);
    throw error;
  }
};

// Generate monthly report data
const generateMonthlyReportData = async (userId) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const tasks = await Task.find({
      user: userId,
      $or: [
        { createdAt: { $gte: startOfMonth, $lte: endOfMonth } },
        { updatedAt: { $gte: startOfMonth, $lte: endOfMonth } }
      ]
    });

    const doneTasks = tasks.filter(task => task.status === 'done');
    const remainingTasks = tasks.filter(task => task.status === 'in-progress');
    const todoTasks = tasks.filter(task => task.status === 'todo');

    const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      monthYear,
      doneTasks: doneTasks.length,
      remainingTasks: remainingTasks.length,
      todoTasks: todoTasks.length,
      doneTasksList: doneTasks.map(task => ({ title: task.title, category: task.category })),
      remainingTasksList: remainingTasks.map(task => ({ title: task.title, category: task.category, progress: task.progress || 0 })),
      todoTasksList: todoTasks.map(task => ({ title: task.title, category: task.category, endDate: task.endDate }))
    };
  } catch (error) {
    console.error('Error generating monthly report data:', error);
    throw error;
  }
};

// Send weekly reports to all users
const sendWeeklyReports = async () => {
  try {
    const users = await User.find({});
    let sentCount = 0;

    for (const user of users) {
      try {
        const reportData = await generateWeeklyReportData(user._id);
        const result = await sendWeeklyReport(user, reportData);
        
        if (result.success) {
          sentCount++;
          console.log(`Weekly report sent to ${user.email}`);
        } else {
          console.error(`Failed to send weekly report to ${user.email}: ${result.error}`);
        }
      } catch (error) {
        console.error(`Error sending weekly report to ${user.email}:`, error);
      }
    }

    console.log(`Weekly reports sent to ${sentCount} users`);
    return sentCount;
  } catch (error) {
    console.error('Error sending weekly reports:', error);
    throw error;
  }
};

// Send monthly reports to all users
const sendMonthlyReports = async () => {
  try {
    const users = await User.find({});
    let sentCount = 0;

    for (const user of users) {
      try {
        const reportData = await generateMonthlyReportData(user._id);
        const result = await sendMonthlyReport(user, reportData);
        
        if (result.success) {
          sentCount++;
          console.log(`Monthly report sent to ${user.email}`);
        } else {
          console.error(`Failed to send monthly report to ${user.email}: ${result.error}`);
        }
      } catch (error) {
        console.error(`Error sending monthly report to ${user.email}:`, error);
      }
    }

    console.log(`Monthly reports sent to ${sentCount} users`);
    return sentCount;
  } catch (error) {
    console.error('Error sending monthly reports:', error);
    throw error;
  }
};

// TEST FUNCTION: Process all notifications for testing (ignores scheduled dates)
const processAllNotificationsForTesting = async () => {
  try {
    console.log('Processing ALL notifications for testing...');
    
    // Get all pending notifications regardless of date
    const allNotifications = await Notification.find({
      status: 'pending'
    }).populate('task user');
    
    let processedCount = 0;
    
    for (const notification of allNotifications) {
      try {
        let result;
        
        // Handle different notification types
        if (['task-start-date', 'task-due-date'].includes(notification.type)) {
          result = await sendScheduledDateNotification(
            notification.type,
            notification.task,
            { email: notification.email, _id: notification.user }
          );
        } else {
          result = await sendTaskNotification(
            notification.type,
            notification.task,
            { email: notification.email, _id: notification.user }
          );
        }

        if (result.success) {
          await notification.markAsSent();
          console.log(`TEST: Notification sent successfully: ${notification.type} for task ${notification.task.title}`);
          processedCount++;
        } else {
          await notification.markAsFailed(result.error);
          console.error(`TEST: Failed to send notification: ${result.error}`);
        }
      } catch (error) {
        await notification.markAsFailed(error.message);
        console.error(`TEST: Error processing notification ${notification._id}:`, error);
      }
    }

    console.log(`TEST: Processed ${processedCount} notifications`);
    return processedCount;
  } catch (error) {
    console.error('TEST: Error processing all notifications:', error);
    throw error;
  }
};

module.exports = {
  sendImmediateTaskCreationNotification,
  sendImmediateTaskActionNotification,
  createTaskNotifications,
  processPendingNotifications,
  checkOverdueTasks,
  updateTaskNotifications,
  cleanupOldNotifications,
  generateWeeklyReportData,
  generateMonthlyReportData,
  sendWeeklyReports,
  sendMonthlyReports,
  processAllNotificationsForTesting
};



