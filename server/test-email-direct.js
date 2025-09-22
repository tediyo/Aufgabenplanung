const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailDirect() {
  try {
    console.log('🔧 Email Configuration:');
    console.log('- HOST:', process.env.EMAIL_HOST);
    console.log('- PORT:', process.env.EMAIL_PORT);
    console.log('- USER:', process.env.EMAIL_USER);
    console.log('- PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('\n📧 Testing email connection...');

    // Verify connection
    await transporter.verify();
    console.log('✅ Email connection verified successfully!');

    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'thedronberhanu16@gmail.com',
      subject: '🧪 Direct Email Test - Task Scheduler',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4CAF50;">✅ Email Test Successful!</h1>
          <p>This is a direct test email from your Task Scheduler application.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If you receive this email, the email service is working correctly!</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);

  } catch (error) {
    console.error('❌ Email test failed:', error);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔑 Authentication Error:');
      console.log('- Check your email credentials');
      console.log('- Make sure you\'re using an App Password (not your regular password)');
      console.log('- For Gmail: Enable 2FA and generate an App Password');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🌐 Connection Error:');
      console.log('- Check your internet connection');
      console.log('- Verify SMTP settings');
    } else if (error.code === 'EDNS') {
      console.log('\n🔍 DNS Error:');
      console.log('- Check your DNS settings');
      console.log('- Try using a different SMTP server');
    }
  }
}

testEmailDirect();
