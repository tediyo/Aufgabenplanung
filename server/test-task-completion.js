const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { sendTaskNotification } = require('./utils/emailService');
require('dotenv').config();

async function testTaskCompletion() {
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

    // Find the test task we just created
    const task = await Task.findOne({ title: 'Complete Notification Test Task' });
    if (!task) {
      console.log('❌ Test task not found');
      return;
    }

    console.log('✅ Found test task:', task.title);

    // Simulate task completion
    task.status = 'done';
    task.progress = 100;
    task.actualHours = 2.5;
    task.completedAt = new Date();
    await task.save();

    console.log('✅ Task marked as completed');

    // Send completion notification
    const result = await sendTaskNotification('taskCompleted', task, user);
    
    if (result.success) {
      console.log('✅ Task completion notification sent successfully!');
    } else {
      console.log('❌ Failed to send completion notification:', result.error);
    }

    console.log('\n🎯 Complete Task Lifecycle:');
    console.log('1. ✅ TASK START - Sent when task begins (start date)');
    console.log('2. ✅ TASK REMINDER - Sent before due date');
    console.log('3. ✅ TASK DUE - Sent on due date');
    console.log('4. ✅ TASK COMPLETED - Sent when task is finished');

    console.log('\n📧 Check your email: thedronberhanu16@gmail.com');
    console.log('You should have received a task completion notification!');

  } catch (error) {
    console.error('❌ Error testing task completion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testTaskCompletion();








