const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');
const cronJobs = require('./utils/cronJobs');

const app = express();

// Security middleware
app.use(helmet());
// CORS configuration for both development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://aufgabenplanung.vercel.app',
      'https://aufgabenplanung-git-master-tewodros-birhanus-projects.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.CORS_ORIGIN,
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    console.log('CORS Origin:', origin);
    console.log('Allowed Origins:', allowedOrigins);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Temporarily allow all origins for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Email']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
// MongoDB connection options for Atlas
const mongoOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

mongoose.connect(process.env.MONGODB_URI, mongoOptions)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📍 Database:', mongoose.connection.db.databaseName);
  console.log('🌐 Host:', mongoose.connection.host);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit the process if database connection fails
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: req.headers.origin || 'no origin',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    databaseState: mongoose.connection.readyState
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const Task = require('./models/Task');
    const User = require('./models/User');
    const Notification = require('./models/Notification');
    
    const taskCount = await Task.countDocuments();
    const userCount = await User.countDocuments();
    const notificationCount = await Notification.countDocuments();
    
    res.json({
      message: 'Database test successful',
      counts: {
        tasks: taskCount,
        users: userCount,
        notifications: notificationCount
      },
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database test failed',
      error: error.message,
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  }
});

// Email test endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const { sendTaskCreationNotification } = require('./utils/emailService');
    
    // Create a test task and user
    const testTask = {
      _id: 'test-task-id',
      title: 'Test Email Notification',
      description: 'This is a test email notification',
      category: 'work',
      priority: 'high',
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimatedHours: 2
    };
    
    const testUser = {
      _id: 'test-user-id',
      name: 'Test User',
      email: process.env.EMAIL_USER // Send to your own email for testing
    };
    
    console.log(`📧 Testing email notification to: ${testUser.email}`);
    const result = await sendTaskCreationNotification(testTask, testUser);
    
    res.json({
      message: 'Email test completed',
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      sentTo: testUser.email,
      result: result
    });
  } catch (error) {
    res.status(500).json({
      message: 'Email test failed',
      error: error.message,
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    });
  }
});

// Test all notification types
app.get('/api/test-all-notifications', async (req, res) => {
  try {
    const { sendImmediateTaskCreationNotification, sendImmediateTaskActionNotification } = require('./utils/notificationUtils');
    
    const testTask = {
      _id: 'test-task-id',
      title: 'Test All Notifications',
      description: 'Testing all notification types',
      category: 'work',
      priority: 'high',
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimatedHours: 2
    };
    
    const testUser = {
      _id: 'test-user-id',
      name: 'Test User',
      email: process.env.EMAIL_USER
    };
    
    console.log(`📧 Testing all notifications to: ${testUser.email}`);
    
    // Test task creation notification
    const creationResult = await sendImmediateTaskCreationNotification(testTask, testUser);
    
    // Test task start notification
    const startResult = await sendImmediateTaskActionNotification('start', testTask, testUser);
    
    // Test task finish notification
    const finishResult = await sendImmediateTaskActionNotification('finish', testTask, testUser);
    
    res.json({
      message: 'All notification tests completed',
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      sentTo: testUser.email,
      results: {
        creation: creationResult,
        start: startResult,
        finish: finishResult
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Notification test failed',
      error: error.message,
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for development`);
  console.log(`Google OAuth endpoint: http://localhost:${PORT}/api/auth/google`);
});

// Start cron jobs for email notifications
cronJobs.start();


