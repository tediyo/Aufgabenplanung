const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

// Email configuration
const createTransporter = () => {
  const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };

  // Debug email configuration
  console.log('📧 Email Configuration Debug:');
  console.log('  EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com');
  console.log('  EMAIL_PORT:', process.env.EMAIL_PORT || 587);
  console.log('  EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
  console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  console.log('  NODE_ENV:', process.env.NODE_ENV);

  // Only create transporter if email credentials are provided
  if (emailConfig.auth.user && emailConfig.auth.pass) {
    console.log('📧 Creating email transporter...');
    return nodemailer.createTransport(emailConfig);
  }
  
  console.log('❌ Email credentials not provided - email service disabled');
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

// Send email notification
const sendEmail = async (to, subject, templateName, data = {}) => {
  const transporter = createTransporter();
  
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

    // Send email
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return { 
      success: false, 
      error: error.message,
      reason: 'Email sending failed',
      details: {
        code: error.code,
        command: error.command
      }
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
