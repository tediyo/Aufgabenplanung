# Quick Google Login Setup

## 🚀 Get Google Login Working in 5 Minutes

### Step 1: Get Google Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized origins: `http://localhost:3000`
7. Copy the Client ID

### Step 2: Add Environment Variable
Create a file called `.env.local` in the `client` folder:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id-here
```

### Step 3: Restart the App
```bash
npm start
```

### Step 4: Test
- Go to the login page
- Click "Continue with Google"
- You should see the Google account picker!

## 🔧 Troubleshooting

**If you see "Invalid client" error:**
- Make sure your Client ID is correct
- Check that `http://localhost:3000` is in authorized origins

**If the button doesn't appear:**
- Check browser console for errors
- Make sure the `.env.local` file is in the `client` folder
- Restart the development server

## 📱 What You'll Get

- ✅ One-click Google login
- ✅ Account picker with your Google accounts
- ✅ Automatic profile retrieval
- ✅ Secure authentication
- ✅ Mobile-friendly design

## 🎯 No Server Required!

This implementation uses Google's client-side library, so you don't need a backend server for Google authentication to work!





