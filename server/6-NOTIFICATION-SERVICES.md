# 🔔 6 Core Notification Services

This document describes the 6 core notification services implemented in the Task Scheduler application.

## 📋 **Overview**

The notification system provides comprehensive email and database notifications for all task-related events. All notifications are stored in the database and sent via email (when configured).

## 🚀 **The 6 Core Services**

### 1. 📝 **Task Creation Notifications**
- **Trigger**: When a new task is created
- **Type**: `task-created`
- **Timing**: Immediate
- **Purpose**: Confirm task creation and provide task details

**Features:**
- ✅ Immediate email notification
- ✅ Database record creation
- ✅ Task details included in email
- ✅ Beautiful HTML email template

**Email Content:**
- Task title, description, category, priority
- Start and end dates
- Estimated duration
- Tags (if any)

---

### 2. 🚀 **Task Start Notifications**
- **Trigger**: When task status changes to `in-progress`
- **Type**: `task-start`
- **Timing**: Immediate
- **Purpose**: Motivate user and track task initiation

**Features:**
- ✅ Immediate email notification
- ✅ Database record creation
- ✅ Encouragement message
- ✅ Task progress tracking

**Email Content:**
- Task details
- Start time
- Due date reminder
- Motivational message

---

### 3. ✅ **Task Completion Notifications**
- **Trigger**: When task status changes to `done`
- **Type**: `task-completed`
- **Timing**: Immediate
- **Purpose**: Celebrate completion and provide summary

**Features:**
- ✅ Immediate email notification
- ✅ Database record creation
- ✅ Completion celebration
- ✅ Performance summary

**Email Content:**
- Completion confirmation
- Actual vs estimated duration
- Category and priority
- Celebration message

---

### 4. 📅 **Task Due Notifications**
- **Trigger**: On the task's due date
- **Type**: `task-due`
- **Timing**: Scheduled (on due date)
- **Purpose**: Remind user that task is due today

**Features:**
- ✅ Scheduled email notification
- ✅ Database record creation
- ✅ Urgency indication
- ✅ Progress status

**Email Content:**
- Due date confirmation
- Current progress
- Priority level
- Urgency message

---

### 5. ⏰ **Task Reminder Notifications**
- **Trigger**: Before the due date (configurable)
- **Type**: `task-reminder`
- **Timing**: Scheduled (before due date)
- **Purpose**: Proactive reminder before deadline

**Features:**
- ✅ Configurable reminder days
- ✅ Scheduled email notification
- ✅ Database record creation
- ✅ Days remaining calculation

**Email Content:**
- Days until due
- Task priority
- Current status
- Gentle reminder message

---

### 6. 🚨 **Overdue Task Notifications**
- **Trigger**: For tasks past their due date
- **Type**: `task-overdue`
- **Timing**: Hourly check (via cron job)
- **Purpose**: Alert user about overdue tasks

**Features:**
- ✅ Automatic detection
- ✅ Days overdue calculation
- ✅ Urgent email notification
- ✅ Database record creation

**Email Content:**
- Days overdue
- Original due date
- Priority level
- Urgent action required

---

## ⚙️ **Configuration**

### **Email Setup**
Set these environment variables in your `.env` file:

```bash
# Gmail (Recommended)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Outlook/Hotmail
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password

# Yahoo
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### **Notification Preferences**
Each task can have custom notification settings:

```javascript
notifications: {
  startDate: true,        // Notify on start date
  endDate: true,         // Notify on due date
  reminder: true,        // Send reminder before due
  reminderDays: 1        // Days before due to send reminder
}
```

## 🕐 **Cron Jobs**

The system runs several automated jobs:

| Job | Schedule | Purpose |
|-----|----------|---------|
| Process Notifications | Every minute | Send pending notifications |
| Check Overdue Tasks | Every hour | Detect and notify overdue tasks |
| Cleanup Old Notifications | Daily at 2 AM | Remove old notification records |
| Weekly Reports | Every Monday at 8 AM | Send weekly progress reports |
| Monthly Reports | 1st of month at 8 AM | Send monthly progress reports |

## 🧪 **Testing**

### **Test All 6 Services**
```bash
cd server
node test-6-notification-services.js
```

### **Test Individual Services**
```bash
# Test email configuration
node test-email.js

# Test all notifications
node test-all-notifications.js

# Test specific notification
node test-manual-notification.js
```

## 📊 **Database Schema**

### **Notification Model**
```javascript
{
  type: String,           // Notification type
  task: ObjectId,         // Reference to task
  user: ObjectId,         // Reference to user
  email: String,          // User's email
  title: String,          // Notification title
  message: String,        // Notification message
  scheduledFor: Date,     // When to send
  sentAt: Date,           // When sent (null if pending)
  status: String,         // pending, sent, failed, cancelled
  retryCount: Number,     // Number of retry attempts
  maxRetries: Number,     // Maximum retry attempts
  errorMessage: String,   // Error details if failed
  isRead: Boolean,        // Whether user has read it
  metadata: Map           // Additional data
}
```

## 🔧 **API Endpoints**

### **Get User Notifications**
```http
GET /api/notifications
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (pending, sent, failed, cancelled)
- `type`: Filter by type (task-created, task-start, etc.)

### **Mark Notification as Read**
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

### **Cancel Notification**
```http
PUT /api/notifications/:id/cancel
Authorization: Bearer <token>
```

## 📈 **Monitoring**

### **Logs to Watch**
```bash
# Server logs
📝 [NOTIFICATION SERVICE 1] Task created: Task Name
🚀 [NOTIFICATION SERVICE 2] TASK START: Task Name
✅ [NOTIFICATION SERVICE 3] TASK COMPLETION: Task Name
📅 [NOTIFICATION SERVICES 4-6] Creating scheduled notifications
🚨 [NOTIFICATION SERVICE 6] Checking for overdue tasks...
```

### **Success Indicators**
- ✅ Email sent successfully: [message-id]
- ✅ Notification saved to database
- ✅ Processed X notifications
- ✅ Found X overdue tasks

### **Error Indicators**
- ❌ Email notification failed: [error]
- ❌ Failed to send notification: [error]
- ❌ Error processing notification: [error]

## 🚀 **Getting Started**

1. **Set up email credentials** in your `.env` file
2. **Start the server** - cron jobs will start automatically
3. **Create a task** - you'll receive a creation notification
4. **Update task status** - you'll receive start/completion notifications
5. **Check logs** - monitor notification processing

## 🎯 **Best Practices**

1. **Configure SMTP properly** - Use app passwords for Gmail
2. **Monitor logs** - Watch for failed notifications
3. **Set appropriate reminder days** - Don't spam users
4. **Test regularly** - Use the test scripts
5. **Clean up old notifications** - The system does this automatically

---

## 📞 **Support**

If you encounter issues with notifications:

1. Check email configuration
2. Verify SMTP credentials
3. Check server logs
4. Run test scripts
5. Ensure cron jobs are running

The notification system is designed to be robust and will retry failed notifications automatically.
