const cron = require('node-cron');
const { processPendingNotifications, checkOverdueTasks, cleanupOldNotifications } = require('./notificationUtils');

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

// Start all cron jobs
const start = () => {
  console.log('Starting cron jobs...');
  processNotificationsJob.start();
  checkOverdueJob.start();
  cleanupJob.start();
  console.log('All cron jobs started');
};

// Stop all cron jobs
const stop = () => {
  console.log('Stopping cron jobs...');
  processNotificationsJob.stop();
  checkOverdueJob.stop();
  cleanupJob.stop();
  console.log('All cron jobs stopped');
};

module.exports = {
  start,
  stop,
  processNotificationsJob,
  checkOverdueJob,
  cleanupJob
};



