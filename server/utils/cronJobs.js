const cron = require('node-cron');
const { 
  processPendingNotifications, 
  checkOverdueTasks, 
  cleanupOldNotifications,
  sendWeeklyReports,
  sendMonthlyReports
} = require('./notificationUtils');

// Process pending notifications every minute
const processNotificationsJob = cron.schedule('* * * * *', async () => {
  try {
    console.log('Processing pending notifications...');
    const processedCount = await processPendingNotifications();
    if (processedCount > 0) {
      console.log(`Processed ${processedCount} notifications`);
    }
  } catch (error) {
    console.error('Error in process notifications job:', error);
  }
}, {
  scheduled: false
});

// Check for overdue tasks every hour
const checkOverdueJob = cron.schedule('0 * * * *', async () => {
  try {
    console.log('Checking for overdue tasks...');
    const overdueCount = await checkOverdueTasks();
    if (overdueCount > 0) {
      console.log(`Found ${overdueCount} overdue tasks`);
    }
  } catch (error) {
    console.error('Error in check overdue job:', error);
  }
}, {
  scheduled: false
});

// Clean up old notifications daily at 2 AM
const cleanupJob = cron.schedule('0 2 * * *', async () => {
  try {
    console.log('Cleaning up old notifications...');
    const cleanedCount = await cleanupOldNotifications();
    console.log(`Cleaned up ${cleanedCount} old notifications`);
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
}, {
  scheduled: false
});

// Send weekly reports every Monday at 8 AM
const weeklyReportJob = cron.schedule('0 8 * * 1', async () => {
  try {
    console.log('Sending weekly reports...');
    const sentCount = await sendWeeklyReports();
    console.log(`Weekly reports sent to ${sentCount} users`);
  } catch (error) {
    console.error('Error in weekly report job:', error);
  }
}, {
  scheduled: false
});

// Send monthly reports on the 1st day of each month at 8 AM
const monthlyReportJob = cron.schedule('0 8 1 * *', async () => {
  try {
    console.log('Sending monthly reports...');
    const sentCount = await sendMonthlyReports();
    console.log(`Monthly reports sent to ${sentCount} users`);
  } catch (error) {
    console.error('Error in monthly report job:', error);
  }
}, {
  scheduled: false
});

// Start all cron jobs
const start = () => {
  console.log('🚀 Starting cron jobs...');
  processNotificationsJob.start();
  checkOverdueJob.start();
  cleanupJob.start();
  weeklyReportJob.start();
  monthlyReportJob.start();
  console.log('✅ All cron jobs started successfully');
  console.log('📋 Cron jobs running:');
  console.log('   - Process notifications: Every minute');
  console.log('   - Check overdue tasks: Every hour');
  console.log('   - Cleanup old notifications: Daily at 2 AM');
  console.log('   - Weekly reports: Every Monday at 9 AM');
  console.log('   - Monthly reports: 1st of every month at 9 AM');
};

// Stop all cron jobs
const stop = () => {
  console.log('Stopping cron jobs...');
  processNotificationsJob.stop();
  checkOverdueJob.stop();
  cleanupJob.stop();
  weeklyReportJob.stop();
  monthlyReportJob.stop();
  console.log('All cron jobs stopped');
};

module.exports = {
  start,
  stop,
  processNotificationsJob,
  checkOverdueJob,
  cleanupJob,
  weeklyReportJob,
  monthlyReportJob
};



