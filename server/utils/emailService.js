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
  taskCreation: (task, user) => ({
    subject: `📝 New Task Created: ${task.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Created</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .status-todo { background: #e3f2fd; color: #1976d2; }
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
            <h1>📝 Task Created!</h1>
            <p>A new task has been added to your schedule</p>
          </div>
          <div class="content">
            <div class="task-card">
              <h2>${task.title}</h2>
              <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
              <p><strong>Category:</strong> ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</p>
              <p><strong>Priority:</strong> <span class="priority-${task.priority}">${task.priority.toUpperCase()}</span></p>
              <p><strong>Status:</strong> <span class="status-badge status-todo">TO DO</span></p>
              <p><strong>Start Date:</strong> ${new Date(task.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> ${new Date(task.endDate).toLocaleDateString()}</p>
              <p><strong>Estimated Duration:</strong> ${task.estimatedHours} hours</p>
              ${task.tags && task.tags.length > 0 ? `<p><strong>Tags:</strong> ${task.tags.map(tag => `#${tag}`).join(' ')}</p>` : ''}
            </div>
            <p>Your task has been successfully created and added to your task list. You can start working on it when ready!</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from your Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  taskStarting: (task, user) => ({
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
          .header { background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
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
            <p>You've begun working on this task</p>
          </div>
          <div class="content">
            <div class="task-card">
              <h2>${task.title}</h2>
              <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
              <p><strong>Category:</strong> ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</p>
              <p><strong>Priority:</strong> <span class="priority-${task.priority}">${task.priority.toUpperCase()}</span></p>
              <p><strong>Status:</strong> <span class="status-badge status-in-progress">IN PROGRESS</span></p>
              <p><strong>Started At:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Due Date:</strong> ${new Date(task.endDate).toLocaleDateString()}</p>
              <p><strong>Estimated Duration:</strong> ${task.estimatedHours} hours</p>
              ${task.tags && task.tags.length > 0 ? `<p><strong>Tags:</strong> ${task.tags.map(tag => `#${tag}`).join(' ')}</p>` : ''}
            </div>
            <p>Great! You've started working on this task. Keep up the momentum and track your progress!</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from your Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  taskFinishing: (task, user) => ({
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
              <p><strong>Completed On:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Duration:</strong> ${task.actualHours || 'N/A'} hours (estimated: ${task.estimatedHours} hours)</p>
              <p><strong>Category:</strong> ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</p>
              <p><strong>Priority:</strong> ${task.priority.toUpperCase()}</p>
              <p><strong>Progress:</strong> 100%</p>
            </div>
            <p>Excellent work! You've successfully completed this task. Keep up the great momentum!</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from your Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  taskStartDate: (task, user) => ({
    subject: `📅 Task Start Date: ${task.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Start Date</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 5px solid #2196f3; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Task Start Date</h1>
            <p>Today is the scheduled start date for this task</p>
          </div>
          <div class="content">
            <div class="task-card">
              <h2>${task.title}</h2>
              <p><strong>Start Date:</strong> ${new Date(task.startDate).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${new Date(task.endDate).toLocaleDateString()}</p>
              <p><strong>Priority:</strong> ${task.priority.toUpperCase()}</p>
              <p><strong>Status:</strong> ${task.status.replace('-', ' ').toUpperCase()}</p>
              <p><strong>Estimated Duration:</strong> ${task.estimatedHours} hours</p>
            </div>
            <p>This task is scheduled to start today. Consider beginning work on it if you haven't already!</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from your Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  taskDueDate: (task, user) => ({
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
              <p><strong>Progress:</strong> ${task.progress || 0}%</p>
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

  weekly: (data, user) => ({
    subject: `📊 Weekly Task Report - ${data.weekRange}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Task Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
          .stat-done { color: #4caf50; }
          .stat-remaining { color: #ff9800; }
          .stat-todo { color: #2196f3; }
          .task-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .task-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .task-item:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Task Report</h1>
            <p>${data.weekRange}</p>
          </div>
          <div class="content">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number stat-done">${data.doneTasks}</div>
                <div>Completed Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-number stat-remaining">${data.remainingTasks}</div>
                <div>Remaining Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-number stat-todo">${data.todoTasks}</div>
                <div>To-Do Tasks</div>
              </div>
            </div>
            ${data.doneTasksList.length > 0 ? `
            <div class="task-list">
              <h3>✅ Completed This Week</h3>
              ${data.doneTasksList.map(task => `<div class="task-item"><strong>${task.title}</strong> - ${task.category}</div>`).join('')}
            </div>
            ` : ''}
            ${data.remainingTasksList.length > 0 ? `
            <div class="task-list">
              <h3>⏳ In Progress</h3>
              ${data.remainingTasksList.map(task => `<div class="task-item"><strong>${task.title}</strong> - ${task.category} (${task.progress}%)</div>`).join('')}
            </div>
            ` : ''}
            ${data.todoTasksList.length > 0 ? `
            <div class="task-list">
              <h3>📝 To Do</h3>
              ${data.todoTasksList.map(task => `<div class="task-item"><strong>${task.title}</strong> - ${task.category} (Due: ${new Date(task.endDate).toLocaleDateString()})</div>`).join('')}
            </div>
            ` : ''}
            <p>Keep up the great work! This week you completed ${data.doneTasks} tasks. ${data.remainingTasks > 0 ? `You have ${data.remainingTasks} tasks in progress and ${data.todoTasks} tasks to start.` : 'All tasks are completed!'}</p>
          </div>
          <div class="footer">
            <p>This is your weekly automated report from Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  monthly: (data, user) => ({
    subject: `📈 Monthly Task Report - ${data.monthYear}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monthly Task Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
          .stat-done { color: #4caf50; }
          .stat-remaining { color: #ff9800; }
          .stat-todo { color: #2196f3; }
          .task-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .task-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .task-item:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Monthly Task Report</h1>
            <p>${data.monthYear}</p>
          </div>
          <div class="content">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number stat-done">${data.doneTasks}</div>
                <div>Completed Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-number stat-remaining">${data.remainingTasks}</div>
                <div>Remaining Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-number stat-todo">${data.todoTasks}</div>
                <div>To-Do Tasks</div>
              </div>
            </div>
            ${data.doneTasksList.length > 0 ? `
            <div class="task-list">
              <h3>✅ Completed This Month</h3>
              ${data.doneTasksList.map(task => `<div class="task-item"><strong>${task.title}</strong> - ${task.category}</div>`).join('')}
            </div>
            ` : ''}
            ${data.remainingTasksList.length > 0 ? `
            <div class="task-list">
              <h3>⏳ In Progress</h3>
              ${data.remainingTasksList.map(task => `<div class="task-item"><strong>${task.title}</strong> - ${task.category} (${task.progress}%)</div>`).join('')}
            </div>
            ` : ''}
            ${data.todoTasksList.length > 0 ? `
            <div class="task-list">
              <h3>📝 To Do</h3>
              ${data.todoTasksList.map(task => `<div class="task-item"><strong>${task.title}</strong> - ${task.category} (Due: ${new Date(task.endDate).toLocaleDateString()})</div>`).join('')}
            </div>
            ` : ''}
            <p>Monthly Summary: You completed ${data.doneTasks} tasks this month. ${data.remainingTasks > 0 ? `You have ${data.remainingTasks} tasks in progress and ${data.todoTasks} tasks to start.` : 'All tasks are completed!'}</p>
          </div>
          <div class="footer">
            <p>This is your monthly automated report from Task Scheduler.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

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
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured, skipping email send');
      return { success: true, messageId: 'skipped', message: 'Email not configured' };
    }

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

// Send immediate task creation notification
const sendTaskCreationNotification = async (task, user) => {
  return await sendTaskNotification('taskCreation', task, user);
};

// Send task action notifications
const sendTaskActionNotification = async (action, task, user) => {
  const typeMap = {
    'start': 'taskStarting',
    'finish': 'taskFinishing'
  };
  
  const type = typeMap[action];
  if (!type) {
    throw new Error(`Invalid action: ${action}`);
  }
  
  return await sendTaskNotification(type, task, user);
};

// Send scheduled date notifications
const sendScheduledDateNotification = async (dateType, task, user) => {
  const typeMap = {
    'start-date': 'taskStartDate',
    'due-date': 'taskDueDate'
  };
  
  const type = typeMap[dateType];
  if (!type) {
    throw new Error(`Invalid date type: ${dateType}`);
  }
  
  return await sendTaskNotification(type, task, user);
};

// Send weekly report
const sendWeeklyReport = async (user, reportData) => {
  return await sendTaskNotification('weekly', reportData, user);
};

// Send monthly report
const sendMonthlyReport = async (user, reportData) => {
  return await sendTaskNotification('monthly', reportData, user);
};

module.exports = {
  sendEmail,
  sendTaskNotification,
  sendTaskCreationNotification,
  sendTaskActionNotification,
  sendScheduledDateNotification,
  sendWeeklyReport,
  sendMonthlyReport,
  emailTemplates
};