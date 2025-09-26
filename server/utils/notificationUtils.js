const Notification = require('../models/Notification');
const Task = require('../models/Task');
const User = require('../models/User');
const { 
  sendTaskCreationEmail, 
  sendTaskReminderEmail, 
  sendTaskCompletionEmail, 
  sendTaskOverdueEmail 
} = require('./sendEmail');

// 1. 📝 TASK CREATION NOTIFICATION SERVICE
const sendImmediateTaskCreationNotification = async (task, user) => {
  try {
    console.log(`📝 [NOTIFICATION SERVICE 1] Task created: ${task.title} for user: ${user.email}`);
    
    let emailResult = { success: false, reason: 'Email not configured' };
    
    // Try to send email if user has email notifications enabled
    if (user.preferences?.emailNotifications !== false) {
      try {
        emailResult = await sendTaskCreationEmail(user, task);
        console.log(`📧 Email result for task creation:`, emailResult);
      } catch (emailError) {
        console.error('📧 Email sending failed for task creation:', emailError);
        emailResult = { success: false, error: emailError.message };
      }
    }
    
    // Always create a notification record in database
    const notification = new Notification({
      user: user._id,
      email: user.email,
      type: 'task-created',
      title: 'Task Created Successfully',
      subject: `📝 New Task Created: ${task.title}`,
      message: `Your task "${task.title}" has been created and is ready to start.`,
      task: task._id,
      scheduledFor: new Date(),
      status: emailResult.success ? 'sent' : 'logged',
      isRead: false,
      metadata: {
        emailSent: emailResult.success,
        emailError: emailResult.error || null
      }
    });
    
    await notification.save();
    console.log(`📝 Notification logged to database for task: ${task.title}`);
    
    return { 
      success: true, 
      message: 'Task creation notification processed',
      emailSent: emailResult.success,
      emailError: emailResult.error
    };
  } catch (error) {
    console.error('Error in task creation notification:', error);
    return { success: false, error: error.message };
  }
};

// 2. 🚀 TASK START NOTIFICATION SERVICE
// 3. ✅ TASK COMPLETION NOTIFICATION SERVICE
const sendImmediateTaskActionNotification = async (action, task, user) => {
  try {
    const isStart = action === 'start';
    const serviceNumber = isStart ? 2 : 3;
    const serviceName = isStart ? 'TASK START' : 'TASK COMPLETION';
    
    console.log(`🚀 [NOTIFICATION SERVICE ${serviceNumber}] ${serviceName}: ${task.title} for user: ${user.email}`);
    
    let emailResult = { success: false, reason: 'Email not configured' };
    
    // Try to send email if user has email notifications enabled
    if (user.preferences?.emailNotifications !== false) {
      try {
        if (action === 'finish' || action === 'completed') {
          emailResult = await sendTaskCompletionEmail(user, task);
        } else if (action === 'start') {
          emailResult = await sendTaskReminderEmail(user, task, 'start');
        }
        console.log(`📧 Email result for task ${action}:`, emailResult);
      } catch (emailError) {
        console.error(`📧 Email sending failed for task ${action}:`, emailError);
        emailResult = { success: false, error: emailError.message };
      }
    }
    
    // Always create notification in database
    const notification = new Notification({
      user: user._id,
      email: user.email,
      type: isStart ? 'task-start' : 'task-completed',
      title: `Task ${action === 'start' ? 'Started' : 'Completed'}`,
      subject: `${isStart ? '🚀' : '✅'} Task ${action === 'start' ? 'Started' : 'Completed'}: ${task.title}`,
      message: `Your task "${task.title}" has been ${action === 'start' ? 'started' : 'completed'}.`,
      task: task._id,
      scheduledFor: new Date(),
      status: emailResult.success ? 'sent' : 'logged',
      isRead: false,
      metadata: {
        emailSent: emailResult.success,
        emailError: emailResult.error || null
      }
    });
    
    await notification.save();
    console.log(`📝 Task ${action} notification logged to database`);
    
    return { 
      success: true, 
      message: `Task ${action} notification processed`,
      emailSent: emailResult.success,
      emailError: emailResult.error
    };
  } catch (error) {
    console.error(`Error sending task ${action} notification:`, error);
    return { success: false, error: error.message };
  }
};

// 4. 📅 TASK DUE NOTIFICATION SERVICE
// 5. ⏰ TASK REMINDER NOTIFICATION SERVICE
// 6. 🚨 OVERDUE TASK NOTIFICATION SERVICE
const createTaskNotifications = async (task, user) => {
  try {
    console.log(`📅 [NOTIFICATION SERVICES 4-6] Creating scheduled notifications for task: ${task.title}`);
    const notifications = [];

    // 4. Start date notification (if task not started by start date)
    if (task.notifications && task.notifications.startDate) {
      notifications.push({
        type: 'task-start-date',
        task: task._id,
        user: user._id,
        email: user.email,
        title: `Task Start Date: ${task.title}`,
        subject: `📅 Task Start Date: ${task.title}`,
        message: `Your task "${task.title}" is scheduled to start today.`,
        scheduledFor: task.startDate,
        status: 'pending'
      });
    }

    // 5. Reminder notification (before due date)
    if (task.notifications && task.notifications.reminder) {
      const reminderDays = task.notifications.reminderDays || 1;
      const reminderDate = new Date(task.endDate);
      reminderDate.setDate(reminderDate.getDate() - reminderDays);
      
      // Only create reminder if it's in the future
      if (reminderDate > new Date()) {
        notifications.push({
          type: 'task-reminder',
          task: task._id,
          user: user._id,
          email: user.email,
          title: `Task Reminder: ${task.title}`,
          subject: `⏰ Task Reminder: ${task.title} is due soon`,
          message: `Your task "${task.title}" is due in ${reminderDays} day(s).`,
          scheduledFor: reminderDate,
          status: 'pending'
        });
      }
    }

    // 4. Due date notification (if task not completed by end date)
    if (task.notifications && task.notifications.endDate) {
      notifications.push({
        type: 'task-due',
        task: task._id,
        user: user._id,
        email: user.email,
        title: `Task Due Today: ${task.title}`,
        subject: `📅 Task Due Today: ${task.title}`,
        message: `Your task "${task.title}" is due today.`,
        scheduledFor: task.endDate,
        status: 'pending'
      });
    }

    // Create notifications in database
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`📅 Created ${notifications.length} scheduled notifications for task: ${task.title}`);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating task notifications:', error);
    // Don't throw error, just log it
    return [];
  }
};

// Process pending notifications (database only)
const processPendingNotifications = async () => {
  try {
    const pendingNotifications = await Notification.getPendingNotifications();
    
    for (const notification of pendingNotifications) {
      try {
        // Just mark as sent since we're only logging to database
        await notification.markAsSent();
        console.log(`Notification logged: ${notification.type} for task ${notification.task?.title || 'unknown'}`);
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

// 6. 🚨 OVERDUE TASK NOTIFICATION SERVICE
const checkOverdueTasks = async () => {
  try {
    console.log(`🚨 [NOTIFICATION SERVICE 6] Checking for overdue tasks...`);
    
    const overdueTasks = await Task.find({
      status: { $nin: ['done', 'cancelled'] },
      endDate: { $lt: new Date() }
    }).populate('user');

    let overdueNotificationsCreated = 0;

    for (const task of overdueTasks) {
      // Check if overdue notification already exists
      const existingNotification = await Notification.findOne({
        task: task._id,
        type: 'task-overdue',
        status: { $in: ['pending', 'sent'] }
      });

      if (!existingNotification) {
        const daysOverdue = Math.ceil((new Date() - new Date(task.endDate)) / (1000 * 60 * 60 * 24));
        
        const notification = new Notification({
          type: 'task-overdue',
          task: task._id,
          user: task.user._id,
          email: task.user.email,
          title: `🚨 OVERDUE: ${task.title}`,
          subject: `🚨 OVERDUE: ${task.title}`,
          message: `Your task "${task.title}" is ${daysOverdue} day(s) overdue. Please complete it as soon as possible.`,
          scheduledFor: new Date(),
          status: 'pending'
        });

        await notification.save();
        console.log(`🚨 Created overdue notification for task: ${task.title} (${daysOverdue} days overdue)`);
        overdueNotificationsCreated++;
      }
    }

    console.log(`🚨 Found ${overdueTasks.length} overdue tasks, created ${overdueNotificationsCreated} new notifications`);
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

// Generate weekly report data (database only)
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

// Generate monthly report data (database only)
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

module.exports = {
  sendImmediateTaskCreationNotification,
  sendImmediateTaskActionNotification,
  createTaskNotifications,
  processPendingNotifications,
  checkOverdueTasks,
  updateTaskNotifications,
  cleanupOldNotifications,
  generateWeeklyReportData,
  generateMonthlyReportData
};



