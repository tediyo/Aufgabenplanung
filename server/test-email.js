const { sendEmail } = require('./utils/emailService');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : 'NOT SET');
  
  try {
    const result = await sendEmail(
      process.env.EMAIL_USER, // Send to yourself for testing
      'Test Email from Task Scheduler',
      '<h1>Email Test</h1><p>If you receive this email, your configuration is working correctly!</p>'
    );
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ Email failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Email test failed:', error.message);
  }
}

testEmail();

