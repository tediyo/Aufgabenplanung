const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { sendTaskNotification } = require('./utils/emailService');
require('dotenv').config();

async function testManualNotification() {
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

    // Find a task
    const task = await Task.findOne({ title: 'Complete Notification Test Task' });
    if (!task) {
      console.log('❌ Task not found');
      return;
    }

    console.log('✅ Found task:', task.title);

    // Test sending notification directly
    console.log('\n📧 Testing direct notification sending...');
    const result = await sendTaskNotification('taskStart', task, user);
    
    if (result.success) {
      console.log('✅ Direct notification sent successfully!');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.log('❌ Direct notification failed:', result.error);
    }

    // Test with a new task
    console.log('\n📧 Testing with new task...');
    const newTask = new Task({
      title: 'Manual Test Task - Email Verification',
      description: 'This task tests manual email sending',
      category: 'personal',
      priority: 'high',
      timeFrame: 'custom',
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimatedHours: 1,
      tags: ['test', 'manual'],
      notifications: {
        startDate: true,
        endDate: true,
        reminder: true,
        reminderDays: 1
      },
      user: user._id
    });

    await newTask.save();
    console.log('✅ New test task created');

    const result2 = await sendTaskNotification('taskStart', newTask, user);
    
    if (result2.success) {
      console.log('✅ New task notification sent successfully!');
      console.log('📧 Message ID:', result2.messageId);
    } else {
      console.log('❌ New task notification failed:', result2.error);
    }

    console.log('\n🎯 Check your email: thedronberhanu16@gmail.com');
    console.log('You should have received 2 test emails!');

  } catch (error) {
    console.error('❌ Error testing manual notification:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testManualNotification();












