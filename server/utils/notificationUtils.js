const Notification = require('../models/Notification');
const Task = require('../models/Task');
const { sendTaskNotification } = require('./emailService');

// Create notifications for a task
const createTaskNotifications = async (task, user) => {
  try {
    const notifications = [];

    // Start date notification
    if (task.notifications.startDate) {
      notifications.push({
        type: 'task-start',
        task: task._id,
        user: user._id,
        email: user.email,
        subject: `Task Started: ${task.title}`,
        message: `Your task "${task.title}" has started.`,
        scheduledFor: task.startDate
      });
    }

    // Reminder notification (before end date)
    if (task.notifications.reminder && task.notifications.reminderDays > 0) {
      const reminderDate = new Date(task.endDate);
      reminderDate.setDate(reminderDate.getDate() - task.notifications.reminderDays);
      
      if (reminderDate > new Date()) {
        notifications.push({
          type: 'task-reminder',
          task: task._id,
          user: user._id,
          email: user.email,
          subject: `Reminder: ${task.title} is due soon`,
          message: `Your task "${task.title}" is due in ${task.notifications.reminderDays} day(s).`,
          scheduledFor: reminderDate
        });
      }
    }

    // Due date notification
    if (task.notifications.endDate) {
      notifications.push({
        type: 'task-due',
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
      console.log(`Created ${notifications.length} notifications for task: ${task.title}`);
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
        // Send email
        const result = await sendTaskNotification(
          notification.type,
          notification.task,
          notification.user
        );

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
      // Delete existing notifications
      await Notification.deleteMany({
        task: taskId,
        type: { $in: ['task-start', 'task-reminder', 'task-due'] }
      });

      // Create new notifications with updated dates
      await createTaskNotifications(task, task.user);
    }

    // If task is completed, create completion notification
    if (updates.status === 'done') {
      const existingCompletionNotification = await Notification.findOne({
        task: taskId,
        type: 'task-completed'
      });

      if (!existingCompletionNotification) {
        const notification = new Notification({
          type: 'task-completed',
          task: taskId,
          user: task.user._id,
          email: task.user.email,
          subject: `Task Completed: ${task.title}`,
          message: `Congratulations! You've completed "${task.title}".`,
          scheduledFor: new Date()
        });

        await notification.save();
      }
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

module.exports = {
  createTaskNotifications,
  processPendingNotifications,
  checkOverdueTasks,
  updateTaskNotifications,
  cleanupOldNotifications
};



