const nodemailer = require('nodemailer');

// Create transporter
const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  taskStart: (task, user) => ({
    subject: `🚀 Task Started: ${task.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Started</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .status-todo { background: #e3f2fd; color: #1976d2; }
          .status-in-progress { background: #fff3e0; color: #f57c00; }
          .priority-high { color: #d32f2f; font-weight: bold; }
          .priority-medium { color: #f57c00; font-weight: bold; }
          .priority-low { color: #388e3c; font-weight: bold; }
          .priority-urgent { color: #d32f2f; font-weight: bold; background: #ffebee; padding: 2px 8px; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Task Started!</h1>
            <p>Time to get things done!</p>
          </div>
          <div class="content">
            <div class="task-card">
              <h2>${task.title}</h2>
              <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
              <p><strong>Category:</strong> ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</p>
              <p><strong>Priority:</strong> <span class="priority-${task.priority}">${task.priority.toUpperCase()}</span></p>
              <p><strong>Status:</strong> <span class="status-badge status-${task.status}">${task.status.replace('-', ' ').toUpperCase()}</span></p>
              <p><strong>Start Date:</strong> ${new Date(task.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> ${new Date(task.endDate).toLocaleDateString()}</p>
              <p><strong>Estimated Duration:</strong> ${task.estimatedHours} hours</p>
              ${task.tags && task.tags.length > 0 ? `<p><strong>Tags:</strong> ${task.tags.map(tag => `#${tag}`).join(' ')}</p>` : ''}
            </div>
            <p>Good luck with your task! Remember to track your progress and update the status as you work.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from your Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  taskReminder: (task, user) => ({
    subject: `⏰ Reminder: ${task.title} is due soon`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .urgent { border-left: 5px solid #d32f2f; }
          .warning { border-left: 5px solid #f57c00; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Task Reminder</h1>
            <p>Don't forget about this important task!</p>
          </div>
          <div class="content">
            <div class="task-card ${task.priority === 'urgent' ? 'urgent' : 'warning'}">
              <h2>${task.title}</h2>
              <p><strong>Due Date:</strong> ${new Date(task.endDate).toLocaleDateString()}</p>
              <p><strong>Days Remaining:</strong> ${Math.ceil((new Date(task.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days</p>
              <p><strong>Priority:</strong> ${task.priority.toUpperCase()}</p>
              <p><strong>Status:</strong> ${task.status.replace('-', ' ').toUpperCase()}</p>
              <p><strong>Progress:</strong> ${task.progress}%</p>
            </div>
            <p>This task is approaching its deadline. Make sure to complete it on time!</p>
          </div>
          <div class="footer">
            <p>This is an automated reminder from your Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  taskDue: (task, user) => ({
    subject: `📅 Task Due Today: ${task.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Due Today</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 5px solid #ff6b6b; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Task Due Today!</h1>
            <p>This task is due today - time to finish it up!</p>
          </div>
          <div class="content">
            <div class="task-card">
              <h2>${task.title}</h2>
              <p><strong>Due Date:</strong> ${new Date(task.endDate).toLocaleDateString()}</p>
              <p><strong>Priority:</strong> ${task.priority.toUpperCase()}</p>
              <p><strong>Status:</strong> ${task.status.replace('-', ' ').toUpperCase()}</p>
              <p><strong>Progress:</strong> ${task.progress}%</p>
            </div>
            <p>This task is due today! Make sure to complete it before the end of the day.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from your Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  taskOverdue: (task, user) => ({
    subject: `🚨 OVERDUE: ${task.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Overdue Task</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 5px solid #d32f2f; }
          .urgent { background: #ffebee; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 OVERDUE TASK!</h1>
            <p>This task is past its due date!</p>
          </div>
          <div class="content">
            <div class="task-card urgent">
              <h2>${task.title}</h2>
              <p><strong>Was Due:</strong> ${new Date(task.endDate).toLocaleDateString()}</p>
              <p><strong>Days Overdue:</strong> ${Math.ceil((new Date() - new Date(task.endDate)) / (1000 * 60 * 60 * 24))} days</p>
              <p><strong>Priority:</strong> ${task.priority.toUpperCase()}</p>
              <p><strong>Status:</strong> ${task.status.replace('-', ' ').toUpperCase()}</p>
              <p><strong>Progress:</strong> ${task.progress}%</p>
            </div>
            <p><strong>This task is overdue!</strong> Please complete it as soon as possible or update the due date if needed.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from your Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  taskCompleted: (task, user) => ({
    subject: `✅ Task Completed: ${task.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Completed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 5px solid #4caf50; }
          .celebration { text-align: center; font-size: 24px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Task Completed!</h1>
            <p>Congratulations on finishing your task!</p>
          </div>
          <div class="content">
            <div class="celebration">🎉</div>
            <div class="task-card">
              <h2>${task.title}</h2>
              <p><strong>Completed On:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Duration:</strong> ${task.actualHours} hours (estimated: ${task.estimatedHours} hours)</p>
              <p><strong>Category:</strong> ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</p>
              <p><strong>Priority:</strong> ${task.priority.toUpperCase()}</p>
            </div>
            <p>Great job! You've successfully completed this task. Keep up the excellent work!</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from your Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransport();
    
    const mailOptions = {
      from: `"Task Scheduler" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send task notification
const sendTaskNotification = async (type, task, user) => {
  try {
    const template = emailTemplates[type];
    if (!template) {
      throw new Error(`Email template not found for type: ${type}`);
    }

    const { subject, html } = template(task, user);
    return await sendEmail(user.email, subject, html);
  } catch (error) {
    console.error('Send task notification failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendTaskNotification,
  emailTemplates
};