# 🔧 Environment Variables Setup

## 📋 **Required Environment Variables**

### **Server (.env in server/ directory)**
```bash
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### **Client (.env in client/ directory)**
```bash
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🚀 **Setup Instructions**

1. **Create .env files** in both `server/` and `client/` directories
2. **Copy the environment variables** from above
3. **Replace placeholder values** with your actual credentials
4. **Restart both servers** after making changes

## 🔐 **Security Notes**

- ✅ **Never commit .env files** to version control
- ✅ **Use environment variables** for all sensitive data
- ✅ **Keep credentials secure** and don't share them
- ✅ **Use different credentials** for development and production

## 📧 **Email Setup (Gmail)**

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password: Google Account Settings → Security → 2-Step Verification → App passwords
3. Use the 16-character app password in `EMAIL_PASS`

## 🔑 **Google OAuth Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)

## ✅ **Verification**

After setup, test the configuration:
- **Server**: Check console for "Connected to MongoDB" and "Email service configured"
- **Client**: Check browser console for no environment variable errors
- **Google Auth**: Test sign-in functionality
- **Email**: Create a task and check for email notifications
