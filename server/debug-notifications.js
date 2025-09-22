const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const Task = require('./models/Task');
const User = require('./models/User');
require('dotenv').config();

async function debugNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-scheduler');
    console.log('Connected to MongoDB');

    // Check pending notifications
    const pendingNotifications = await Notification.find({ 
      status: 'pending',
      scheduledFor: { $lte: new Date() }
    }).populate('task');

    console.log(`\n📧 Found ${pendingNotifications.length} pending notifications:`);
    
    for (const notif of pendingNotifications) {
      console.log(`- ${notif.type}: ${notif.task?.title || 'Unknown task'} (${notif.email}) - scheduled for ${notif.scheduledFor}`);
    }

    // Check failed notifications
    const failedNotifications = await Notification.find({ 
      status: 'failed'
    }).populate('task');

    console.log(`\n❌ Found ${failedNotifications.length} failed notifications:`);
    
    for (const notif of failedNotifications) {
      console.log(`- ${notif.type}: ${notif.task?.title || 'Unknown task'} (${notif.email}) - error: ${notif.errorMessage}`);
    }

    // Check sent notifications
    const sentNotifications = await Notification.find({ 
      status: 'sent'
    }).populate('task');

    console.log(`\n✅ Found ${sentNotifications.length} sent notifications:`);
    
    for (const notif of sentNotifications) {
      console.log(`- ${notif.type}: ${notif.task?.title || 'Unknown task'} (${notif.email}) - sent at ${notif.sentAt}`);
    }

    // Check environment variables
    console.log('\n🔧 Environment check:');
    console.log('- EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
    console.log('- EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
    console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

  } catch (error) {
    console.error('❌ Error debugging notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugNotifications();






