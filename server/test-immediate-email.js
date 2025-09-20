const { sendTaskNotification } = require('./utils/emailService');
require('dotenv').config();

async function testImmediateEmail() {
  console.log('Testing immediate email notification...');
  
  const testTask = {
    _id: 'test123',
    title: 'Test Task',
    description: 'This is a test task',
    category: 'personal',
    priority: 'medium',
    status: 'todo',
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    estimatedHours: 2,
    actualHours: 0,
    progress: 0,
    tags: ['test']
  };

  const testUser = {
    _id: 'user123',
    email: process.env.EMAIL_USER, // Send to yourself
    name: 'Test User'
  };

  try {
    const result = await sendTaskNotification('taskStart', testTask, testUser);
    
    if (result.success) {
      console.log('✅ Immediate email notification sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ Email notification failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending immediate notification:', error.message);
  }
}

testImmediateEmail();
