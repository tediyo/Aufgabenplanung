const path = require('path');
const dotenv = require('dotenv');

// Try multiple paths for .env file
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env'),
  path.join(process.cwd(), '.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (result.parsed) {
      console.log('📧 .env file loaded from:', envPath);
      envLoaded = true;
      break;
    }
  } catch (error) {
    console.log('📧 Failed to load .env from:', envPath);
  }
}

if (!envLoaded) {
  console.log('📧 No .env file found in any expected location');
}

console.log('📧 Email Configuration Test');
console.log('==========================');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'Not set');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'Not set');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (hidden)' : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');

// Test email service
const { sendTaskCreationEmail } = require('./utils/sendEmail');
const User = require('./models/User');

async function testEmail() {
  try {
    // Create a test user
    const testUser = {
      _id: 'test123',
      name: 'Test User',
      email: 'test@example.com',
      preferences: { emailNotifications: true }
    };

    // Create a test task
    const testTask = {
      _id: 'task123',
      title: 'Test Task',
      description: 'This is a test task for email verification',
      category: 'personal',
      priority: 'medium',
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimatedHours: 1
    };

    console.log('\n📧 Testing email sending...');
    const result = await sendTaskCreationEmail(testUser, testTask);
    console.log('📧 Email result:', result);
  } catch (error) {
    console.error('❌ Email test error:', error);
  }
}

testEmail();
