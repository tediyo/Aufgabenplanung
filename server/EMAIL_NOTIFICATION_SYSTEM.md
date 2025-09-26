# 📧 Email Notification System

## Overview
The Task Manager now includes a comprehensive email notification system that works seamlessly with or without email configuration. All notifications are always saved to the database for tracking and management.

## 🏗️ Architecture

```
project/
│── frontend/ (React)
│   ├── pages/
│   ├── components/
│   ├── utils/api.js (API calls to backend)
│
│── backend/ (Node.js/Express)
│   ├── routes/
│   │   ├── taskRoutes.js
│   │   └── auth.js
│   ├── jobs/
│   │   └── scheduler.js (Email job scheduler)
│   ├── utils/
│   │   ├── sendEmail.js (Email service)
│   │   ├── notificationUtils.js (Notification logic)
│   │   └── templates/ (HTML email templates)
│   │       ├── task-created.html
│   │       ├── task-reminder.html
│   │       ├── task-completed.html
│   │       ├── task-overdue.html
│   │       └── weekly-summary.html
│   └── index.js (server entry)
```

## ✨ Features

### ✅ **Always Works - Even Without Email Configuration**
- **Database Notifications** - All notifications saved to MongoDB
- **Console Logging** - Detailed logs in server console
- **Notification Management** - View notifications in app
- **Graceful Degradation** - System works perfectly without email setup

### 📧 **Email Notifications (When Configured)**
- **Task Creation** - Welcome email when new task is created
- **Task Reminders** - Daily reminders for upcoming tasks
- **Task Completion** - Celebration email when task is completed
- **Overdue Alerts** - Notifications for overdue tasks
- **Weekly Summaries** - Productivity reports every Monday

## 🔧 Configuration

### Environment Variables
Add these to your `server/.env` file:

```env
# Email Configuration (Optional)
# Leave empty to disable email notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

## 📅 Scheduled Jobs

The system runs these automated jobs:

| Job | Schedule | Description |
|-----|----------|-------------|
| **Daily Reminders** | 9:00 AM UTC | Sends reminders for tasks starting today/tomorrow |
| **Overdue Alerts** | 6:00 PM UTC | Notifies about overdue tasks |
| **Weekly Summaries** | Monday 8:00 AM UTC | Sends productivity reports |

## 🎨 Email Templates

### Professional HTML Templates
- **Responsive Design** - Works on all devices
- **Brand Colors** - Consistent with app theme
- **Clear CTAs** - Direct links to dashboard
- **Rich Content** - Task details, progress, and stats

### Template Types
1. **Task Created** - Welcome new tasks with details
2. **Task Reminder** - Gentle reminders with urgency indicators
3. **Task Completed** - Celebration with completion stats
4. **Task Overdue** - Urgent alerts with overdue count
5. **Weekly Summary** - Comprehensive productivity report

## 🔄 Notification Flow

### 1. **Immediate Notifications**
```javascript
// Task creation
await sendImmediateTaskCreationNotification(task, user);

// Task status changes
await sendImmediateTaskActionNotification('start', task, user);
await sendImmediateTaskActionNotification('completed', task, user);
```

### 2. **Scheduled Notifications**
```javascript
// Daily reminders (9 AM)
await sendDailyReminders();

// Overdue alerts (6 PM)
await sendOverdueNotifications();

// Weekly summaries (Monday 8 AM)
await sendWeeklySummaries();
```

### 3. **Database Logging**
Every notification is logged with:
- User ID and email
- Task ID (if applicable)
- Notification type
- Send status (sent/logged/failed)
- Timestamp
- Error details (if failed)

## 🛠️ API Endpoints

### Notification Management
```javascript
// Get user notifications
GET /api/notifications

// Get notification stats
GET /api/notifications/stats

// Delete notification
DELETE /api/notifications/:id

// Cancel notification
PUT /api/notifications/:id/cancel
```

### User Preferences
```javascript
// Update email preferences
PUT /api/auth/preferences
{
  "emailNotifications": true,
  "reminderTime": "09:00",
  "timezone": "UTC"
}
```

## 📊 Monitoring & Debugging

### Console Logs
```
📧 Email sent successfully: <messageId>
📧 Email service not configured - saving notification to database only
❌ Error sending email: <error details>
📝 Notification logged to database for task: <taskTitle>
```

### Database Queries
```javascript
// Check notification status
db.notifications.find({ user: ObjectId("...") })

// Check email sending success rate
db.notifications.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

## 🚀 Getting Started

### 1. **Without Email (Default)**
- System works immediately
- All notifications saved to database
- View notifications in app dashboard

### 2. **With Email Configuration**
1. Set up Gmail App Password
2. Add email credentials to `.env`
3. Restart server
4. Test with task creation

### 3. **Testing Email**
```bash
# Check scheduler status
curl http://localhost:5000/api/notifications/stats

# Create test task to trigger email
# Check server logs for email status
```

## 🔒 Security & Privacy

- **No Email Storage** - Email credentials only in environment variables
- **User Control** - Users can disable email notifications
- **Secure SMTP** - Uses TLS encryption for email sending
- **Error Handling** - Graceful fallback to database logging

## 📈 Performance

- **Non-blocking** - Email sending doesn't block task operations
- **Retry Logic** - Failed emails are logged for retry
- **Batch Processing** - Efficient scheduled job processing
- **Memory Efficient** - Templates loaded on demand

## 🎯 Benefits

1. **Always Functional** - Works with or without email
2. **User Friendly** - Beautiful, responsive email templates
3. **Comprehensive** - Covers all task lifecycle events
4. **Reliable** - Database backup for all notifications
5. **Scalable** - Handles multiple users efficiently
6. **Maintainable** - Clean, modular code structure

---

**Built with ❤️ for the Task Manager application**
