const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const Notification = require('./models/Notification');
const { processPendingNotifications } = require('./utils/notificationUtils');
require('dotenv').config();

async function processNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-scheduler');
    console.log('Connected to MongoDB');

    // Process pending notifications
    console.log('Processing pending notifications...');
    const count = await processPendingNotifications();
    console.log(`✅ Processed ${count} notifications`);

  } catch (error) {
    console.error('❌ Error processing notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

processNotifications();
