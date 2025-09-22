const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { createTaskNotifications, processPendingNotifications } = require('./utils/notificationUtils');
require('dotenv').config();

async function testAllNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-scheduler');
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'thedronberhanu16@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ Found user:', user.email);

    // Create a task with start date today and end date tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const task = new Task({
      title: 'Complete Notification Test Task',
      description: 'This task tests all notification types: start, reminder, and due date',
      category: 'personal',
      priority: 'high',
      timeFrame: 'custom',
      startDate: today,
      endDate: tomorrow,
      estimatedHours: 2,
      tags: ['test', 'notifications'],
      notifications: {
        startDate: true,
        endDate: true,
        reminder: true,
        reminderDays: 1
      },
      user: user._id
    });

    await task.save();
    console.log('✅ Test task created:', task.title);
    console.log('📅 Start Date:', task.startDate.toLocaleDateString());
    console.log('📅 End Date:', task.endDate.toLocaleDateString());

    // Create notifications
    await createTaskNotifications(task, user);
    console.log('✅ Notifications created for test task');

    // Check what notifications were created
    const notifications = await Notification.find({ task: task._id }).sort({ scheduledFor: 1 });
    console.log('\n📧 Notifications created:');
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.type.toUpperCase()}: scheduled for ${notif.scheduledFor.toLocaleString()} to ${notif.email}`);
    });

    // Process pending notifications (this will send emails)
    console.log('\n🔄 Processing pending notifications...');
    const processedCount = await processPendingNotifications();
    console.log(`✅ Processed ${processedCount} notifications`);

    console.log('\n🎯 Expected email notifications:');
    console.log('1. 🚀 TASK START - You should receive this immediately (start date is today)');
    console.log('2. ⏰ TASK REMINDER - You should receive this (1 day before due date)');
    console.log('3. 📅 TASK DUE - You should receive this tomorrow (on due date)');

    console.log('\n📧 Check your email: thedronberhanu16@gmail.com');
    console.log('You should have received the start notification and reminder notification!');

  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAllNotifications();







