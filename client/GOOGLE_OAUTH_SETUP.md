# 🔐 Google OAuth Setup Guide

## ✅ **What's Already Done**

1. **Client ID & Secret**: Your credentials are configured
2. **Server Endpoints**: `/api/auth/google` endpoint created
3. **Database Schema**: User model updated for Google OAuth
4. **Frontend Components**: Google login button and callback page ready

## 🚀 **Next Steps**

### **Step 1: Update Google Cloud Console**

Go to [Google Cloud Console](https://console.cloud.google.com/) and update your OAuth 2.0 Client:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://localhost:3000
https://aufgabenplanung.vercel.app
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/google/callback
https://localhost:3000/auth/google/callback
https://aufgabenplanung.vercel.app/auth/google/callback
```

### **Step 2: Start the Server**

```bash
cd server
npm start
```

### **Step 3: Start the Client**

```bash
cd client
npm start
```

### **Step 4: Test Google Login**

1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. You'll be redirected to Google's OAuth page
4. After authentication, you'll be redirected back to the dashboard

## 🔧 **How It Works**

1. **User clicks "Continue with Google"**
2. **Redirects to Google OAuth** with your Client ID
3. **User authenticates** with Google
4. **Google redirects back** to `/auth/google/callback` with authorization code
5. **Server exchanges code** for access token
6. **Server gets user info** from Google
7. **Server creates/updates user** in database
8. **User is logged in** and redirected to dashboard

## 🎯 **Your Credentials**

- **Client ID**: `718113492631-v55nut1svg9mo39ltdmcvd3s95lk2hr3.apps.googleusercontent.com`
- **Client Secret**: `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`

## 🚨 **Important Notes**

- Make sure your server is running on port 5000
- Make sure your client is running on port 3000
- The redirect URIs must match exactly in Google Cloud Console
- For production, update the redirect URI to your Vercel URL

## 🎉 **Ready to Test!**

Once you've updated the Google Cloud Console settings, your Google OAuth will work perfectly!

