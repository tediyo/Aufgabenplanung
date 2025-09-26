const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'task-created',      // When a new task is created
      'task-start',        // When a task is started (in-progress)
      'task-completed',    // When a task is completed (done)
      'task-due',          // On the task's due date
      'task-reminder',     // Before the due date (configurable)
      'task-overdue',      // For tasks past their due date
      'task-start-date',   // On the task's start date
      'task-due-date',     // On the task's due date (alternative)
      'weekly-summary',    // Weekly productivity summary
      'monthly-summary'    // Monthly productivity summary
    ]
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  sentAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled', 'logged'],
    default: 'pending'
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  errorMessage: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ scheduledFor: 1, status: 1 });
notificationSchema.index({ user: 1, status: 1 });
notificationSchema.index({ task: 1 });
notificationSchema.index({ user: 1, isRead: 1 });

// Static methods
notificationSchema.statics.getPendingNotifications = function() {
  return this.find({ 
    status: 'pending', 
    scheduledFor: { $lte: new Date() } 
  }).populate('task user');
};

notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const { page = 1, limit = 20, status, type } = options;
  const query = { user: userId };
  
  if (status) query.status = status;
  if (type) query.type = type;
  
  return this.find(query)
    .populate('task')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Instance methods
notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.retryCount += 1;
  return this.save();
};

notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

notificationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

notificationSchema.methods.canRetry = function() {
  return this.retryCount < this.maxRetries && this.status === 'failed';
};
notificationSchema.statics.getPendingNotifications = function() {
  return this.find({
    status: 'pending',
    scheduledFor: { $lte: new Date() }
  }).populate('task user');
};

// Static method to get overdue notifications
notificationSchema.statics.getOverdueNotifications = function() {
  return this.find({
    status: 'pending',
    scheduledFor: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours ago
  }).populate('task user');
};

module.exports = mongoose.model('Notification', notificationSchema);


