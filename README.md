# Task Scheduler - Full Stack Web Application

A comprehensive task scheduling and planning web application with advanced features including email notifications, time tracking, analytics, and interactive dashboards.

## 🚀 Features

### 📋 Task Management
- **Create Tasks** with detailed forms including time frames, priorities, and categories
- **Flexible Time Frames**: Daily, Weekly, Monthly, Annually, and Custom
- **Task Templates**: Pre-built templates for common task types
- **Recurring Tasks**: Set up recurring patterns for regular activities
- **Task Status Tracking**: Todo → In Progress → Done → Cancelled
- **Progress Tracking**: Visual progress indicators with percentage completion
- **Time Tracking**: Start/stop timer with actual vs estimated hours tracking

### 📧 Email Notifications
- **Start Date Notifications**: Get notified when tasks begin
- **Deadline Reminders**: Alerts before tasks are due
- **Overdue Notifications**: Urgent alerts for late tasks
- **Beautiful HTML Email Templates**: Professional email designs with task details
- **Customizable Reminder Settings**: Set reminder days and notification preferences

### 📊 Interactive Dashboard & Analytics
- **Comprehensive Analytics**: Pie charts, bar charts, and trend analysis
- **Task Breakdown**: By category, priority, status, and time frame
- **Productivity Tracking**: Time-based insights and completion rates
- **Export Functionality**: Export reports in CSV and JSON formats
- **Custom Date Range Filtering**: Analyze data for specific periods
- **Real-time Updates**: Dashboard updates without page refresh

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Tailwind CSS**: Modern, clean, and customizable styling
- **Interactive Charts**: Hover effects and tooltips for better data visualization
- **Intuitive Navigation**: Easy-to-use interface with clear navigation
- **Dark/Light Mode Ready**: Built with theming support

### 🔐 User Management
- **User Authentication**: Secure login and registration
- **Profile Management**: Update personal information and preferences
- **Password Management**: Secure password change functionality
- **Notification Preferences**: Customize email and reminder settings

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Node-cron** for scheduled tasks
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Chart.js** with React Chart.js 2 for data visualization
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Date-fns** for date manipulation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-scheduler
   JWT_SECRET=your-super-secret-jwt-key-here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm run server
   
   # Frontend only
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🚀 Quick Start

1. **Register a new account** or use the login page
2. **Create your first task** using the "New Task" button
3. **Choose from templates** or create a custom task
4. **Set up notifications** for task reminders
5. **Track your progress** using the time tracking feature
6. **View analytics** on the dashboard and reports pages

## 📱 Usage Guide

### Creating Tasks
1. Click "New Task" from the dashboard or tasks page
2. Choose a template or create a custom task
3. Fill in task details (title, description, category, priority)
4. Set time frame and dates
5. Add tags and configure notifications
6. Save the task

### Time Tracking
1. Navigate to the tasks page
2. Find a task with "In Progress" status
3. Click the play button to start the timer
4. Click the pause button to stop the timer
5. View time tracking history in the task details

### Viewing Reports
1. Go to the Reports page
2. Select a time period or custom date range
3. View various charts and analytics
4. Export data in CSV or JSON format

### Managing Notifications
1. Go to Profile → Notifications tab
2. Enable/disable email notifications
3. Set reminder time and timezone
4. Configure notification preferences

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering and pagination)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/start-timer` - Start time tracking
- `POST /api/tasks/:id/stop-timer` - Stop time tracking
- `GET /api/tasks/templates` - Get task templates

### Reports
- `GET /api/reports/dashboard` - Get dashboard analytics
- `GET /api/reports/productivity` - Get productivity analytics
- `GET /api/reports/export` - Export data (CSV/JSON)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/stats` - Get notification statistics
- `DELETE /api/notifications/:id` - Delete notification
- `PUT /api/notifications/:id/cancel` - Cancel notification

## 🗄️ Database Schema

### User Model
- Personal information (name, email, password)
- Preferences (notifications, reminder time, timezone)
- Authentication tokens

### Task Model
- Basic info (title, description, category, priority)
- Time management (start/end dates, estimated/actual hours)
- Status tracking (todo, in-progress, done, cancelled)
- Recurring patterns and notifications
- Time tracking sessions
- Tags and metadata

### Notification Model
- Notification type and content
- Scheduling and delivery status
- Retry logic and error handling
- User and task associations

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for security
- **Helmet Security**: Security headers for protection
- **Environment Variables**: Sensitive data in environment variables

## 📈 Performance Features

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading with pagination
- **Caching**: Strategic caching for better performance
- **Lazy Loading**: Components loaded as needed
- **Optimized Queries**: Efficient database queries
- **Image Optimization**: Optimized assets and images

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, DigitalOcean, or AWS
4. Set up email service (Gmail, SendGrid, etc.)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3
3. Configure environment variables for API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] Advanced reporting and analytics
- [ ] Integration with calendar apps
- [ ] AI-powered task suggestions
- [ ] Advanced time tracking features
- [ ] Custom themes and branding
- [ ] API webhooks for integrations

---

**Built with ❤️ using React, Node.js, and MongoDB**

