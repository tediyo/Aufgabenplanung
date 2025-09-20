const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { createTaskNotifications } = require('./utils/notificationUtils');
require('dotenv').config();

async function createRealTask() {
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

    // Create a task with TODAY as start date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const task = new Task({
      title: 'Real Test Task - Start Today',
      description: 'This task starts today and should trigger an email notification',
      category: 'personal',
      priority: 'high',
      timeFrame: 'custom',
      startDate: today,
      endDate: tomorrow,
      estimatedHours: 4,
      tags: ['test', 'notification'],
      notifications: {
        startDate: true,
        endDate: true,
        reminder: true,
        reminderDays: 1
      },
      user: user._id
    });

    await task.save();
    console.log('✅ Real task created:', task.title);
    console.log('📅 Start Date:', task.startDate);
    console.log('📅 End Date:', task.endDate);

    // Create notifications
    await createTaskNotifications(task, user);
    console.log('✅ Notifications created for real task');

    // Check notifications
    const notifications = await Notification.find({ task: task._id });
    console.log('📧 Notifications created:');
    notifications.forEach(notif => {
      console.log(`- ${notif.type}: scheduled for ${notif.scheduledFor} to ${notif.email}`);
    });

    console.log('\n🎯 Next steps:');
    console.log('1. The cron job should process the start date notification within 1 minute');
    console.log('2. Check your email: thedronberhanu16@gmail.com');
    console.log('3. You should receive a "Task Started" email notification');

    // Don't clean up - keep the task for testing
    console.log('\n📝 Task ID:', task._id);
    console.log('You can check the task in your frontend or delete it later');

  } catch (error) {
    console.error('❌ Error creating real task:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createRealTask();
