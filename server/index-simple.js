const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Simple in-memory storage for testing
let tasks = [];
let users = [];
let taskId = 1;

// Mock user for testing
const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

// Mock auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: mockUser
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (name && email && password) {
    res.json({
      message: 'Registration successful',
      token: 'mock-jwt-token',
      user: mockUser
    });
  } else {
    res.status(400).json({ message: 'Registration failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: mockUser });
});

// Mock task routes
app.get('/api/tasks', (req, res) => {
  res.json({
    tasks: tasks,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalTasks: tasks.length,
      hasNext: false,
      hasPrev: false
    }
  });
});

app.post('/api/tasks', (req, res) => {
  const task = {
    _id: taskId++,
    ...req.body,
    user: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    progress: 0,
    actualHours: 0,
    timeTracking: []
  };
  tasks.push(task);
  res.status(201).json({
    message: 'Task created successfully',
    task
  });
});

app.get('/api/tasks/templates', (req, res) => {
  res.json({
    'daily-workout': {
      title: 'Daily Workout',
      description: 'Complete your daily exercise routine',
      category: 'health',
      priority: 'medium',
      timeFrame: 'daily',
      estimatedHours: 1,
      tags: ['fitness', 'health', 'routine']
    },
    'weekly-review': {
      title: 'Weekly Review',
      description: 'Review your week and plan for the next one',
      category: 'work',
      priority: 'high',
      timeFrame: 'weekly',
      estimatedHours: 2,
      tags: ['planning', 'review', 'productivity']
    },
    'monthly-budget': {
      title: 'Monthly Budget Review',
      description: 'Review and update your monthly budget',
      category: 'finance',
      priority: 'high',
      timeFrame: 'monthly',
      estimatedHours: 1.5,
      tags: ['finance', 'budget', 'planning']
    },
    'annual-goal': {
      title: 'Annual Goal Planning',
      description: 'Set and review your annual goals',
      category: 'personal',
      priority: 'high',
      timeFrame: 'annually',
      estimatedHours: 4,
      tags: ['goals', 'planning', 'personal']
    }
  });
});

// Mock reports
app.get('/api/reports/dashboard', (req, res) => {
  res.json({
    overview: {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length,
      cancelledTasks: tasks.filter(t => t.status === 'cancelled').length,
      overdueTasks: 0,
      completionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0,
      productivityScore: 85
    },
    timeTracking: {
      totalEstimatedHours: tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
      totalActualHours: tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0),
      timeAccuracy: 90
    },
    distribution: {
      byCategory: tasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {}),
      byPriority: tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {}),
      byStatus: {
        todo: tasks.filter(t => t.status === 'todo').length,
        'in-progress': tasks.filter(t => t.status === 'in-progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length
      },
      byTimeFrame: tasks.reduce((acc, task) => {
        acc[task.timeFrame] = (acc[task.timeFrame] || 0) + 1;
        return acc;
      }, {})
    },
    trends: {
      recentTasks: tasks.filter(t => new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      upcomingTasks: 0
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend should connect to: http://localhost:${PORT}`);
});

