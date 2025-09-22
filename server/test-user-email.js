const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { createTaskNotifications } = require('./utils/notificationUtils');
const { processPendingNotifications } = require('./utils/notificationUtils');
require('dotenv').config();

async function testUserEmail() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-scheduler');
    console.log('Connected to MongoDB');

    // Find the specific user
    const user = await User.findOne({ email: 'thedronberhanu16@gmail.com' });
    if (!user) {
      console.log('❌ User not found: thedronberhanu16@gmail.com');
      return;
    }

    console.log('✅ Found user:', user.email);

    // Create a test task with today's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const testTask = new Task({
      title: 'Test Task for User Email',
      description: 'This is a test task to check email notifications',
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
      console.log(`- ${notif.type}: scheduled for ${notif.scheduledFor} to ${notif.email}`);
    });

    // Process pending notifications (this will send emails)
    console.log('📤 Processing pending notifications...');
    const processedCount = await processPendingNotifications();
    console.log(`📤 Processed ${processedCount} notifications`);

    // Clean up test task
    await Task.findByIdAndDelete(testTask._id);
    await Notification.deleteMany({ task: testTask._id });
    console.log('🧹 Test task and notifications cleaned up');

  } catch (error) {
    console.error('❌ Error testing user email:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testUserEmail();





