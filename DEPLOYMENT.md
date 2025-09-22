# 🚀 Deployment Guide

## Overview
- **Client (React)**: Deploy to Vercel
- **Server (Node.js)**: Deploy to Render
- **Database**: MongoDB Atlas

## 📱 Client Deployment (Vercel)

### 1. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from root directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: task-scheduler-client
# - Directory: ./
# - Override settings? N
```

### 2. Configure Environment Variables in Vercel Dashboard
Go to your project settings → Environment Variables and add:
```
REACT_APP_API_URL=https://your-render-app.onrender.com/api
```

### 3. Redeploy
After adding environment variables, redeploy your app.

## 🖥️ Server Deployment (Render)

### 1. Prepare for Render
```bash
# Go to server directory
cd server

# Make sure all dependencies are installed
npm install
```

### 2. Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `task-scheduler-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Configure Environment Variables in Render
Add these environment variables in Render dashboard:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-scheduler
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 4. Deploy
Click "Create Web Service" and wait for deployment.

## 🔗 Connect Client to Server

### 1. Get Your Render URL
After server deployment, copy your Render URL (e.g., `https://task-scheduler-api.onrender.com`)

### 2. Update Vercel Environment Variables
In Vercel dashboard, update:
```
REACT_APP_API_URL=https://task-scheduler-api.onrender.com/api
```

### 3. Redeploy Client
Trigger a new deployment in Vercel.

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster
4. Get connection string

### 2. Configure Database Access
1. Create database user
2. Whitelist IP addresses (0.0.0.0/0 for Render)
3. Get connection string

### 3. Update Environment Variables
Use the connection string in both:
- Render (server): `MONGODB_URI`
- Local development: `.env` file

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure `CORS_ORIGIN` in Render matches your Vercel URL
   - Check server CORS configuration

2. **Database Connection**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist includes Render's IPs

3. **Environment Variables**
   - Double-check all variables are set correctly
   - Redeploy after changing variables

4. **Build Failures**
   - Check build logs in Vercel/Render
   - Ensure all dependencies are in package.json

## 📊 Monitoring

### Vercel
- View deployment logs
- Monitor performance
- Check function logs

### Render
- View server logs
- Monitor uptime
- Check resource usage

## 🔄 Updates

### Client Updates
1. Push changes to GitHub
2. Vercel auto-deploys
3. Update environment variables if needed

### Server Updates
1. Push changes to GitHub
2. Render auto-deploys
3. Update environment variables if needed

## 🎉 Success!

Once both are deployed:
- Client: `https://your-app.vercel.app`
- Server: `https://your-app.onrender.com`
- Database: MongoDB Atlas

Your full-stack task scheduler is now live! 🚀

