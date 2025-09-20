const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { createTaskNotifications } = require('./utils/notificationUtils');
require('dotenv').config();

async function testNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-scheduler');
    console.log('Connected to MongoDB');

    // Find a user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    console.log('✅ Found user:', user.email);

    // Create a test task with today's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const testTask = new Task({
      title: 'Test Task for Notifications',
      description: 'This is a test task to check notifications',
      category: 'personal',
      priority: 'medium',
      timeFrame: 'custom',
      startDate: today,
      endDate: tomorrow,
      estimatedHours: 2,
      tags: ['test'],
      notifications: {
        startDate: true,
        endDate: true,
        reminder: true,
        reminderDays: 1
      },
      user: user._id
    });

    await testTask.save();
    console.log('✅ Test task created:', testTask.title);

    // Create notifications
    await createTaskNotifications(testTask, user);
    console.log('✅ Notifications created for test task');

    // Check notifications in database
    const notifications = await Notification.find({ task: testTask._id });
    console.log('📧 Notifications in database:', notifications.length);
    
    notifications.forEach(notif => {
      console.log(`- ${notif.type}: scheduled for ${notif.scheduledFor}`);
    });

    // Check if any notifications are due now
    const dueNotifications = await Notification.find({
      task: testTask._id,
      scheduledFor: { $lte: new Date() },
      status: 'pending'
    });
    
    console.log('⏰ Notifications due now:', dueNotifications.length);

    // Clean up test task
    await Task.findByIdAndDelete(testTask._id);
    await Notification.deleteMany({ task: testTask._id });
    console.log('🧹 Test task and notifications cleaned up');

  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testNotifications();
