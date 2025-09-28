const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

// Check if we should use SendGrid instead of Gmail SMTP
const useSendGrid = process.env.SENDGRID_API_KEY || process.env.EMAIL_SERVICE === 'sendgrid';

// Email configuration with multiple fallback options
const createTransporter = async () => {
  // Debug email configuration
  console.log('📧 Email Configuration Debug:');
  console.log('  EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com');
  console.log('  EMAIL_PORT:', process.env.EMAIL_PORT || 465);
  console.log('  EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
  console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  console.log('  SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
  console.log('  EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'gmail');
  console.log('  NODE_ENV:', process.env.NODE_ENV);

  // Check if email is disabled in production due to SMTP issues
  if (process.env.NODE_ENV === 'production' && process.env.DISABLE_EMAIL === 'true') {
    console.log('📧 Email sending disabled in production - using database notifications only');
    return null;
  }

  // Try SendGrid first if configured
  if (useSendGrid && process.env.SENDGRID_API_KEY) {
    console.log('📧 Using SendGrid email service');
    try {
      const transporter = nodemailer.createTransporter({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
      console.log('✅ SendGrid transporter created successfully');
      return transporter;
    } catch (error) {
      console.log('❌ SendGrid configuration failed:', error.message);
    }
  }

  // Only create Gmail transporter if email credentials are provided
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not provided - email service disabled');
    return null;
  }

  // Multiple SMTP configurations to try (optimized for Render)
  const configs = [
    // Gmail with port 587 (TLS) - better for cloud hosting
    {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { 
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      rateLimit: 10
    },
    // Gmail with port 465 (SSL) with extended timeouts
    {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { 
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      rateLimit: 10
    },
    // Alternative Gmail configuration with timeouts
    {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { 
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      rateLimit: 10
    },
    // Fallback with minimal configuration
    {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 60000,
      greetingTimeout: 60000,
      socketTimeout: 60000
    }
  ];

  // Try each configuration
  for (const config of configs) {
    try {
      console.log(`📧 Trying SMTP config: ${config.host || config.service}:${config.port || 'default'}`);
      const transporter = nodemailer.createTransport(config);
      
      // Return transporter without verification (we'll test during actual send)
      console.log(`✅ SMTP transporter created with: ${config.host || config.service}:${config.port || 'default'}`);
      return transporter;
    } catch (error) {
      console.log(`❌ SMTP config failed: ${config.host || config.service}:${config.port || 'default'} - ${error.message}`);
    }
  }

  console.error('❌ All SMTP configurations failed');
  return null;
};

// Load email template
const loadTemplate = async (templateName, data = {}) => {
  try {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    let template = await fs.readFile(templatePath, 'utf8');
    
    // Replace placeholders with actual data
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), data[key] || '');
    });
    
    return template;
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    return null;
  }
};

// Send email notification with retry mechanism
const sendEmail = async (to, subject, templateName, data = {}, retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  const transporter = await createTransporter();
  
  if (!transporter) {
    console.log('📧 Email service not configured - saving notification to database only');
    return { success: false, reason: 'Email service not configured' };
  }

  try {
    // Load email template
    const htmlContent = await loadTemplate(templateName, data);
    
    if (!htmlContent) {
      throw new Error(`Template ${templateName} not found`);
    }

    // Email options
    const mailOptions = {
      from: `"Task Manager" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    };

    // Send email with timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email send timeout')), 45000); // 45 second timeout
    });

    const result = await Promise.race([sendPromise, timeoutPromise]);
    console.log('📧 Email sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error(`❌ Error sending email (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });

    // Retry logic for connection timeouts
    if (retryCount < maxRetries && (error.code === 'ETIMEDOUT' || error.message.includes('timeout'))) {
      console.log(`🔄 Retrying email send in ${retryDelay}ms... (attempt ${retryCount + 2})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return await sendEmail(to, subject, templateName, data, retryCount + 1);
    }

    // Even if email fails, we consider it a partial success since notification is logged to DB
    console.log('📧 Email failed but notification saved to database - this is acceptable');
    return { 
      success: false, 
      error: error.message,
      reason: 'Email sending failed but notification logged to database',
      details: {
        code: error.code,
        command: error.command,
        attempts: retryCount + 1
      },
      fallback: 'Database notification saved'
    };
  }
};

// Send task creation notification
const sendTaskCreationEmail = async (user, task) => {
  const data = {
    userName: user.name || user.email.split('@')[0],
    taskTitle: task.title,
    taskDescription: task.description || 'No description provided',
    taskCategory: task.category,
    taskPriority: task.priority,
    startDate: new Date(task.startDate).toLocaleDateString(),
    endDate: new Date(task.endDate).toLocaleDateString(),
    estimatedHours: task.estimatedHours || 0,
    appUrl: process.env.FRONTEND_URL || 'https://aufgabenplanung.vercel.app'
  };

  return await sendEmail(
    user.email,
    `New Task Created: ${task.title}`,
    'task-created',
    data
  );
};

// Send task reminder notification
const sendTaskReminderEmail = async (user, task, reminderType = 'general') => {
  const data = {
    userName: user.name || user.email.split('@')[0],
    taskTitle: task.title,
    taskDescription: task.description || 'No description provided',
    taskCategory: task.category,
    taskPriority: task.priority,
    startDate: new Date(task.startDate).toLocaleDateString(),
    endDate: new Date(task.endDate).toLocaleDateString(),
    reminderType: reminderType,
    appUrl: process.env.FRONTEND_URL || 'https://aufgabenplanung.vercel.app'
  };

  return await sendEmail(
    user.email,
    `Task Reminder: ${task.title}`,
    'task-reminder',
    data
  );
};

// Send task completion notification
const sendTaskCompletionEmail = async (user, task) => {
  const data = {
    userName: user.name || user.email.split('@')[0],
    taskTitle: task.title,
    taskDescription: task.description || 'No description provided',
    completionDate: new Date().toLocaleDateString(),
    appUrl: process.env.FRONTEND_URL || 'https://aufgabenplanung.vercel.app'
  };

  return await sendEmail(
    user.email,
    `Task Completed: ${task.title}`,
    'task-completed',
    data
  );
};

// Send task overdue notification
const sendTaskOverdueEmail = async (user, task) => {
  const data = {
    userName: user.name || user.email.split('@')[0],
    taskTitle: task.title,
    taskDescription: task.description || 'No description provided',
    endDate: new Date(task.endDate).toLocaleDateString(),
    daysOverdue: Math.ceil((new Date() - new Date(task.endDate)) / (1000 * 60 * 60 * 24)),
    appUrl: process.env.FRONTEND_URL || 'https://aufgabenplanung.vercel.app'
  };

  return await sendEmail(
    user.email,
    `Task Overdue: ${task.title}`,
    'task-overdue',
    data
  );
};

// Send weekly summary email
const sendWeeklySummaryEmail = async (user, summaryData) => {
  const data = {
    userName: user.name || user.email.split('@')[0],
    weekStart: summaryData.weekStart,
    weekEnd: summaryData.weekEnd,
    totalTasks: summaryData.totalTasks,
    completedTasks: summaryData.completedTasks,
    pendingTasks: summaryData.pendingTasks,
    overdueTasks: summaryData.overdueTasks,
    completionRate: summaryData.completionRate,
    appUrl: process.env.FRONTEND_URL || 'https://aufgabenplanung.vercel.app'
  };

  return await sendEmail(
    user.email,
    `Weekly Task Summary - ${summaryData.weekStart} to ${summaryData.weekEnd}`,
    'weekly-summary',
    data
  );
};

// Send monthly summary email
const sendMonthlySummaryEmail = async (user, summaryData) => {
  const data = {
    userName: user.name || user.email.split('@')[0],
    monthName: summaryData.monthName,
    year: summaryData.year,
    totalTasks: summaryData.totalTasks,
    completedTasks: summaryData.completedTasks,
    pendingTasks: summaryData.pendingTasks,
    overdueTasks: summaryData.overdueTasks,
    completionRate: summaryData.completionRate,
    mostProductiveDay: summaryData.mostProductiveDay,
    avgTasksPerDay: summaryData.avgTasksPerDay,
    longestStreak: summaryData.longestStreak,
    categoriesUsed: summaryData.categoriesUsed,
    appUrl: process.env.FRONTEND_URL || 'https://aufgabenplanung.vercel.app'
  };

  return await sendEmail(
    user.email,
    `Monthly Task Summary - ${summaryData.monthName} ${summaryData.year}`,
    'monthly-summary',
    data
  );
};

module.exports = {
  sendEmail,
  sendTaskCreationEmail,
  sendTaskReminderEmail,
  sendTaskCompletionEmail,
  sendTaskOverdueEmail,
  sendWeeklySummaryEmail,
  sendMonthlySummaryEmail
};
