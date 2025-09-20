# Quick Setup Guide

## Prerequisites
1. **MongoDB** - Make sure MongoDB is installed and running
2. **Node.js** - Version 16 or higher

## Setup Steps

### 1. Install Dependencies ✅
```bash
# Server dependencies (already done)
cd server
npm install

# Client dependencies (already done)  
cd ../client
npm install
```

### 2. Configure Environment Variables
The `.env` file has been created in the server directory. You need to update it with your settings:

**File: `server/.env`**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-scheduler
JWT_SECRET=your-super-secret-jwt-key-here-change-this
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

**Important:** 
- Change `JWT_SECRET` to a random string
- For email notifications, use Gmail with an App Password (not your regular password)
- Make sure MongoDB is running on your system

### 3. Start MongoDB
Make sure MongoDB is running on your system:
- **Windows**: Start MongoDB service or run `mongod`
- **Mac**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### 4. Run the Application
```bash
# From the root directory
npm run dev
```

This will start both the backend (port 5000) and frontend (port 3000).

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## First Time Setup
1. Open http://localhost:3000
2. Click "Create a new account" 
3. Register with your email and password
4. Start creating tasks!

## Troubleshooting

### If MongoDB connection fails:
- Make sure MongoDB is running
- Check the MONGODB_URI in server/.env
- Try: `mongod` in a separate terminal

### If email notifications don't work:
- Use Gmail with App Password (not regular password)
- Enable 2-factor authentication on Gmail
- Generate App Password: Google Account → Security → App passwords

### If ports are busy:
- Change PORT in server/.env
- Kill processes using ports 3000 or 5000

