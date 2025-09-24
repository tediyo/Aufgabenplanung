const mongoose = require('mongoose');

const futureTaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [200, 'Task name cannot be more than 200 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'health', 'education', 'finance', 'other'],
    default: 'personal'
  },
  estimatedDate: {
    type: Date,
    required: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
futureTaskSchema.index({ user: 1, createdAt: -1 });
futureTaskSchema.index({ user: 1, isCompleted: 1 });

module.exports = mongoose.model('FutureTask', futureTaskSchema);
