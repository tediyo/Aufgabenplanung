const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['work', 'personal', 'health', 'finance', 'education', 'other'],
    default: 'personal'
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['todo', 'in-progress', 'done', 'cancelled'],
    default: 'todo'
  },
  timeFrame: {
    type: String,
    required: [true, 'Time frame is required'],
    enum: ['daily', 'weekly', 'monthly', 'annually', 'custom']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    default: 0
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    default: 0
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot be more than 100'],
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    endRecurrence: Date
  },
  template: {
    type: String,
    enum: ['daily-workout', 'weekly-review', 'monthly-budget', 'annual-goal', 'custom'],
    default: 'custom'
  },
  notifications: {
    startDate: {
      type: Boolean,
      default: true
    },
    endDate: {
      type: Boolean,
      default: true
    },
    reminder: {
      type: Boolean,
      default: true
    },
    reminderDays: {
      type: Number,
      min: 0,
      max: 30,
      default: 1
    }
  },
  timeTracking: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    duration: Number, // in minutes
    description: String
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, startDate: 1, endDate: 1 });
taskSchema.index({ user: 1, category: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ isRecurring: 1, startDate: 1 });

// Virtual for duration in days
taskSchema.virtual('durationInDays').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for isOverdue
taskSchema.virtual('isOverdue').get(function() {
  return this.status !== 'done' && new Date() > this.endDate;
});

// Virtual for daysUntilStart
taskSchema.virtual('daysUntilStart').get(function() {
  const diffTime = this.startDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for daysUntilEnd
taskSchema.virtual('daysUntilEnd').get(function() {
  const diffTime = this.endDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to update progress
taskSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  if (this.progress === 100) {
    this.status = 'done';
  } else if (this.progress > 0) {
    this.status = 'in-progress';
  }
  return this.save();
};

// Method to start time tracking
taskSchema.methods.startTimeTracking = function(description = '') {
  this.timeTracking.push({
    startTime: new Date(),
    description
  });
  return this.save();
};

// Method to stop time tracking
taskSchema.methods.stopTimeTracking = function() {
  const activeTracking = this.timeTracking.find(t => !t.endTime);
  if (activeTracking) {
    activeTracking.endTime = new Date();
    activeTracking.duration = Math.round((activeTracking.endTime - activeTracking.startTime) / (1000 * 60));
    this.actualHours += activeTracking.duration / 60;
  }
  return this.save();
};

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);


