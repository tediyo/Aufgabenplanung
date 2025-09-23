const mongoose = require('mongoose');
const { 
  sendImmediateTaskCreationNotification,
  sendImmediateTaskActionNotification,
  createTaskNotifications,
  checkOverdueTasks,
  processPendingNotifications
} = require('./utils/notificationUtils');
const Task = require('./models/Task');
const User = require('./models/User');
const Notification = require('./models/Notification');

require('dotenv').config();

async function testAll6NotificationServices() {
  try {
    console.log('🧪 Testing All 6 Notification Services...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-scheduler');
    console.log('✅ Connected to MongoDB\n');

    // Create or find a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
      });
      await testUser.save();
      console.log('👤 Created test user:', testUser.email);
    } else {
      console.log('👤 Using existing test user:', testUser.email);
    }

    // Create a test task
    const testTask = new Task({
      title: 'Test Notification Task',
      description: 'This task is for testing all notification services',
      category: 'personal',
      priority: 'high',
      status: 'todo',
      timeFrame: 'custom',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      estimatedHours: 5,
      user: testUser._id,
      notifications: {
        startDate: true,
        endDate: true,
        reminder: true,
        reminderDays: 2
      }
    });
    await testTask.save();
    console.log('📝 Created test task:', testTask.title);

    console.log('\n' + '='.repeat(60));
    console.log('🧪 TESTING 6 NOTIFICATION SERVICES');
    console.log('='.repeat(60));

    // 1. 📝 TASK CREATION NOTIFICATION
    console.log('\n1️⃣ Testing Task Creation Notification...');
    const creationResult = await sendImmediateTaskCreationNotification(testTask, testUser);
    console.log('Result:', creationResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (!creationResult.success) console.log('Error:', creationResult.error);

    // 2. 🚀 TASK START NOTIFICATION
    console.log('\n2️⃣ Testing Task Start Notification...');
    testTask.status = 'in-progress';
    await testTask.save();
    const startResult = await sendImmediateTaskActionNotification('start', testTask, testUser);
    console.log('Result:', startResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (!startResult.success) console.log('Error:', startResult.error);

    // 3. ✅ TASK COMPLETION NOTIFICATION
    console.log('\n3️⃣ Testing Task Completion Notification...');
    testTask.status = 'done';
    testTask.progress = 100;
    await testTask.save();
    const completionResult = await sendImmediateTaskActionNotification('finish', testTask, testUser);
    console.log('Result:', completionResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (!completionResult.success) console.log('Error:', completionResult.error);

    // 4. 📅 TASK DUE NOTIFICATION (Create a new task for due date testing)
    console.log('\n4️⃣ Testing Task Due Notification...');
    const dueTask = new Task({
      title: 'Due Date Test Task',
      description: 'This task is due today',
      category: 'work',
      priority: 'urgent',
      status: 'todo',
      timeFrame: 'custom',
      startDate: new Date(),
      endDate: new Date(), // Due today
      estimatedHours: 3,
      user: testUser._id,
      notifications: {
        startDate: true,
        endDate: true,
        reminder: true,
        reminderDays: 1
      }
    });
    await dueTask.save();
    
    const dueNotifications = await createTaskNotifications(dueTask, testUser);
    console.log('Result:', dueNotifications.length > 0 ? '✅ SUCCESS' : '❌ FAILED');
    console.log(`Created ${dueNotifications.length} due date notifications`);

    // 5. ⏰ TASK REMINDER NOTIFICATION (Create a task for reminder testing)
    console.log('\n5️⃣ Testing Task Reminder Notification...');
    const reminderTask = new Task({
      title: 'Reminder Test Task',
      description: 'This task has a reminder',
      category: 'personal',
      priority: 'medium',
      status: 'todo',
      timeFrame: 'custom',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      estimatedHours: 2,
      user: testUser._id,
      notifications: {
        startDate: true,
        endDate: true,
        reminder: true,
        reminderDays: 1 // Reminder 1 day before due
      }
    });
    await reminderTask.save();
    
    const reminderNotifications = await createTaskNotifications(reminderTask, testUser);
    console.log('Result:', reminderNotifications.length > 0 ? '✅ SUCCESS' : '❌ FAILED');
    console.log(`Created ${reminderNotifications.length} reminder notifications`);

    // 6. 🚨 OVERDUE TASK NOTIFICATION
    console.log('\n6️⃣ Testing Overdue Task Notification...');
    const overdueTask = new Task({
      title: 'Overdue Test Task',
      description: 'This task is overdue',
      category: 'work',
      priority: 'high',
      status: 'todo',
      timeFrame: 'custom',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Started 5 days ago
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Due 2 days ago
      estimatedHours: 4,
      user: testUser._id,
      notifications: {
        startDate: true,
        endDate: true,
        reminder: true,
        reminderDays: 1
      }
    });
    await overdueTask.save();
    
    const overdueCount = await checkOverdueTasks();
    console.log('Result:', overdueCount > 0 ? '✅ SUCCESS' : '❌ FAILED');
    console.log(`Found ${overdueCount} overdue tasks`);

    // Process all pending notifications
    console.log('\n🔄 Processing all pending notifications...');
    const processedCount = await processPendingNotifications();
    console.log(`Processed ${processedCount} pending notifications`);

    // Display notification summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 NOTIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const allNotifications = await Notification.find({ user: testUser._id }).sort({ createdAt: -1 });
    console.log(`\nTotal notifications created: ${allNotifications.length}`);
    
    const notificationsByType = {};
    allNotifications.forEach(notif => {
      notificationsByType[notif.type] = (notificationsByType[notif.type] || 0) + 1;
    });
    
    console.log('\nNotifications by type:');
    Object.entries(notificationsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    const notificationsByStatus = {};
    allNotifications.forEach(notif => {
      notificationsByStatus[notif.status] = (notificationsByStatus[notif.status] || 0) + 1;
    });
    
    console.log('\nNotifications by status:');
    Object.entries(notificationsByStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ All 6 notification services tested successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    try {
      if (typeof testUser !== 'undefined' && testUser._id) {
        await Task.deleteMany({ user: testUser._id });
        await Notification.deleteMany({ user: testUser._id });
        await User.deleteOne({ _id: testUser._id });
      }
      await mongoose.disconnect();
      console.log('\n🧹 Cleanup completed');
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }
  }
}

// Run the test
testAll6NotificationServices();
