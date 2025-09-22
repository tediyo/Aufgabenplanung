const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const { sendScheduledDateNotification } = require('./utils/emailService');
require('dotenv').config();

async function testReusNotification() {
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

    // Find the "reus" task
    const task = await Task.findOne({ title: 'reus' });
    if (!task) {
      console.log('❌ Task "reus" not found');
      return;
    }

    console.log('✅ Found task:', task.title);
    console.log('📅 Start Date:', task.startDate.toLocaleDateString());
    console.log('📅 End Date:', task.endDate.toLocaleDateString());
    console.log('📊 Status:', task.status);

    // Test sending Start Date notification directly
    console.log('\n📧 Testing Start Date notification...');
    const result = await sendScheduledDateNotification('start-date', task, user);
    
    if (result.success) {
      console.log('✅ Start Date notification sent successfully!');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.log('❌ Start Date notification failed:', result.error);
    }

    // Test sending Due Date notification directly
    console.log('\n📧 Testing Due Date notification...');
    const result2 = await sendScheduledDateNotification('due-date', task, user);
    
    if (result2.success) {
      console.log('✅ Due Date notification sent successfully!');
      console.log('📧 Message ID:', result2.messageId);
    } else {
      console.log('❌ Due Date notification failed:', result2.error);
    }

    console.log('\n🎉 Test completed! Check your email for notifications.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testReusNotification();
