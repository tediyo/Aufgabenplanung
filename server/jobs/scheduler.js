const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { 
  sendTaskReminderEmail, 
  sendTaskOverdueEmail, 
  sendWeeklySummaryEmail,
  sendMonthlySummaryEmail 
} = require('../utils/sendEmail');

class EmailScheduler {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
  }

  // Start all scheduled jobs
  start() {
    if (this.isRunning) {
      console.log('📧 Email scheduler is already running');
      return;
    }

    console.log('📧 Starting email scheduler...');
    this.isRunning = true;

    // Schedule daily task reminders (9 AM)
    this.scheduleJob('daily-reminders', '0 9 * * *', this.sendDailyReminders.bind(this));

    // Schedule overdue task notifications (6 PM)
    this.scheduleJob('overdue-notifications', '0 18 * * *', this.sendOverdueNotifications.bind(this));

    // Schedule weekly summaries (Monday 8 AM)
    this.scheduleJob('weekly-summaries', '0 8 * * 1', this.sendWeeklySummaries.bind(this));

    // Schedule monthly summaries (1st of every month at 9 AM)
    this.scheduleJob('monthly-summaries', '0 9 1 * *', this.sendMonthlySummaries.bind(this));

    console.log('✅ Email scheduler started successfully');
  }

  // Stop all scheduled jobs
  stop() {
    if (!this.isRunning) {
      console.log('📧 Email scheduler is not running');
      return;
    }

    console.log('📧 Stopping email scheduler...');
    
    this.jobs.forEach((job, name) => {
      job.destroy();
      console.log(`📧 Stopped job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;
    console.log('✅ Email scheduler stopped');
  }

  // Schedule a cron job
  scheduleJob(name, cronExpression, task) {
    try {
      const job = cron.schedule(cronExpression, task, {
        scheduled: false,
        timezone: 'UTC'
      });

      job.start();
      this.jobs.set(name, job);
      console.log(`📧 Scheduled job: ${name} (${cronExpression})`);
    } catch (error) {
      console.error(`❌ Error scheduling job ${name}:`, error);
    }
  }

  // Send daily task reminders
  async sendDailyReminders() {
    console.log('📧 Running daily reminders job...');
    
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find tasks starting today or tomorrow
      const upcomingTasks = await Task.find({
        status: { $in: ['todo', 'in-progress'] },
        startDate: { $gte: today, $lte: tomorrow }
      }).populate('user');

      console.log(`📧 Found ${upcomingTasks.length} upcoming tasks`);

      for (const task of upcomingTasks) {
        if (task.user && task.user.preferences?.emailNotifications !== false) {
          try {
            const reminderType = task.startDate.toDateString() === today.toDateString() 
              ? 'start' 
              : 'upcoming';

            await sendTaskReminderEmail(task.user, task, reminderType);
            
            // Log notification in database
            await this.logNotification(task.user._id, task._id, 'reminder', {
              type: reminderType,
              sent: true
            });

            console.log(`📧 Sent reminder for task: ${task.title}`);
          } catch (error) {
            console.error(`❌ Error sending reminder for task ${task._id}:`, error);
            
            // Log failed notification
            await this.logNotification(task.user._id, task._id, 'reminder', {
              type: reminderType,
              sent: false,
              error: error.message
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in daily reminders job:', error);
    }
  }

  // Send overdue task notifications
  async sendOverdueNotifications() {
    console.log('📧 Running overdue notifications job...');
    
    try {
      const today = new Date();
      
      // Find overdue tasks
      const overdueTasks = await Task.find({
        status: { $in: ['todo', 'in-progress'] },
        endDate: { $lt: today }
      }).populate('user');

      console.log(`📧 Found ${overdueTasks.length} overdue tasks`);

      for (const task of overdueTasks) {
        if (task.user && task.user.preferences?.emailNotifications !== false) {
          try {
            await sendTaskOverdueEmail(task.user, task);
            
            // Log notification in database
            await this.logNotification(task.user._id, task._id, 'overdue', {
              sent: true
            });

            console.log(`📧 Sent overdue notification for task: ${task.title}`);
          } catch (error) {
            console.error(`❌ Error sending overdue notification for task ${task._id}:`, error);
            
            // Log failed notification
            await this.logNotification(task.user._id, task._id, 'overdue', {
              sent: false,
              error: error.message
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in overdue notifications job:', error);
    }
  }

  // Send weekly summaries
  async sendWeeklySummaries() {
    console.log('📧 Running weekly summaries job...');
    
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

      // Get all users who have email notifications enabled
      const users = await User.find({
        'preferences.emailNotifications': { $ne: false }
      });

      console.log(`📧 Sending weekly summaries to ${users.length} users`);

      for (const user of users) {
        try {
          // Get user's tasks for the week
          const tasks = await Task.find({
            user: user._id,
            createdAt: { $gte: weekStart, $lte: weekEnd }
          });

          // Calculate summary data
          const summaryData = {
            weekStart: weekStart.toLocaleDateString(),
            weekEnd: weekEnd.toLocaleDateString(),
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'done').length,
            pendingTasks: tasks.filter(t => ['todo', 'in-progress'].includes(t.status)).length,
            overdueTasks: tasks.filter(t => t.status !== 'done' && t.endDate < today).length
          };

          summaryData.completionRate = summaryData.totalTasks > 0 
            ? Math.round((summaryData.completedTasks / summaryData.totalTasks) * 100)
            : 0;

          // Only send if user has tasks
          if (summaryData.totalTasks > 0) {
            await sendWeeklySummaryEmail(user, summaryData);
            
            // Log notification in database
            await this.logNotification(user._id, null, 'weekly-summary', {
              sent: true,
              summaryData
            });

            console.log(`📧 Sent weekly summary to: ${user.email}`);
          }
        } catch (error) {
          console.error(`❌ Error sending weekly summary to user ${user._id}:`, error);
          
          // Log failed notification
          await this.logNotification(user._id, null, 'weekly-summary', {
            sent: false,
            error: error.message
          });
        }
      }
    } catch (error) {
      console.error('❌ Error in weekly summaries job:', error);
    }
  }

  // Send monthly summaries
  async sendMonthlySummaries() {
    console.log('📧 Running monthly summaries job...');
    
    try {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Get all users who have email notifications enabled
      const users = await User.find({
        'preferences.emailNotifications': { $ne: false }
      });

      console.log(`📧 Sending monthly summaries to ${users.length} users`);

      for (const user of users) {
        try {
          // Get user's tasks for the month
          const tasks = await Task.find({
            user: user._id,
            createdAt: { $gte: monthStart, $lte: monthEnd }
          });

          // Calculate monthly summary data
          const completedTasks = tasks.filter(t => t.status === 'done');
          const pendingTasks = tasks.filter(t => ['todo', 'in-progress'].includes(t.status));
          const overdueTasks = tasks.filter(t => t.status !== 'done' && t.endDate < today);

          // Calculate additional metrics
          const categories = [...new Set(tasks.map(t => t.category))];
          const avgTasksPerDay = Math.round((tasks.length / monthEnd.getDate()) * 10) / 10;
          
          // Find most productive day (simplified - just count tasks by day)
          const tasksByDay = {};
          tasks.forEach(task => {
            const day = task.createdAt.toDateString();
            tasksByDay[day] = (tasksByDay[day] || 0) + 1;
          });
          const mostProductiveDay = Object.keys(tasksByDay).reduce((a, b) => 
            tasksByDay[a] > tasksByDay[b] ? a : b, 'No tasks'
          );

          const summaryData = {
            monthName: monthStart.toLocaleDateString('en-US', { month: 'long' }),
            year: monthStart.getFullYear(),
            totalTasks: tasks.length,
            completedTasks: completedTasks.length,
            pendingTasks: pendingTasks.length,
            overdueTasks: overdueTasks.length,
            mostProductiveDay: mostProductiveDay,
            avgTasksPerDay: avgTasksPerDay,
            longestStreak: 7, // Simplified - could be calculated from task completion dates
            categoriesUsed: categories.length
          };

          summaryData.completionRate = summaryData.totalTasks > 0 
            ? Math.round((summaryData.completedTasks / summaryData.totalTasks) * 100)
            : 0;

          // Only send if user has tasks
          if (summaryData.totalTasks > 0) {
            await sendMonthlySummaryEmail(user, summaryData);
            
            // Log notification in database
            await this.logNotification(user._id, null, 'monthly-summary', {
              sent: true,
              summaryData
            });

            console.log(`📧 Sent monthly summary to: ${user.email}`);
          }
        } catch (error) {
          console.error(`❌ Error sending monthly summary to user ${user._id}:`, error);
          
          // Log failed notification
          await this.logNotification(user._id, null, 'monthly-summary', {
            sent: false,
            error: error.message
          });
        }
      }
    } catch (error) {
      console.error('❌ Error in monthly summaries job:', error);
    }
  }

  // Log notification in database
  async logNotification(userId, taskId, type, details) {
    try {
      const notification = new Notification({
        user: userId,
        task: taskId,
        type: type,
        title: this.getNotificationTitle(type),
        message: this.getNotificationMessage(type, details),
        status: details.sent ? 'sent' : 'failed',
        metadata: details
      });

      await notification.save();
    } catch (error) {
      console.error('❌ Error logging notification:', error);
    }
  }

  // Get notification title based on type
  getNotificationTitle(type) {
    const titles = {
      'reminder': 'Task Reminder',
      'overdue': 'Task Overdue',
      'weekly-summary': 'Weekly Summary',
      'created': 'Task Created',
      'completed': 'Task Completed'
    };
    return titles[type] || 'Notification';
  }

  // Get notification message based on type
  getNotificationMessage(type, details) {
    const messages = {
      'reminder': `Task reminder sent${details.sent ? ' successfully' : ' failed'}`,
      'overdue': `Overdue task notification sent${details.sent ? ' successfully' : ' failed'}`,
      'weekly-summary': `Weekly summary sent${details.sent ? ' successfully' : ' failed'}`,
      'created': `Task creation notification sent${details.sent ? ' successfully' : ' failed'}`,
      'completed': `Task completion notification sent${details.sent ? ' successfully' : ' failed'}`
    };
    return messages[type] || 'Notification processed';
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobsCount: this.jobs.size,
      jobs: Array.from(this.jobs.keys())
    };
  }
}

// Create singleton instance
const emailScheduler = new EmailScheduler();

module.exports = emailScheduler;
