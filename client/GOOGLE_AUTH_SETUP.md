# Google OAuth Setup Guide

## 🚀 Setting up Google Authentication

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Task Scheduler"
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Add test users (for development)

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
5. Copy the Client ID and Client Secret

### 4. Environment Variables

Create a `.env` file in the `client` directory:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 5. Update Configuration

Replace the placeholder values in `client/src/config/googleAuth.js`:

```javascript
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-actual-client-id';
```

### 6. Test the Integration

1. Start your development server: `npm start`
2. Go to the login page
3. Click "Continue with Google"
4. Complete the OAuth flow

## 🔧 Features Included

- ✅ Google OAuth 2.0 integration
- ✅ Popup-based authentication
- ✅ Automatic user profile retrieval
- ✅ Secure token handling
- ✅ Error handling and user feedback
- ✅ Mobile-responsive design
- ✅ Branded Google login button

## 🎨 Customization

The Google login button matches your app's branding with:
- Clean white background with border
- Google's official colors and logo
- Hover effects and transitions
- Loading states
- Responsive design

## 🔒 Security Notes

- Client secret should only be used server-side in production
- Consider implementing server-side token validation
- Use HTTPS in production
- Regularly rotate your OAuth credentials

## 📱 Mobile Support

The Google login works seamlessly on:
- Desktop browsers
- Mobile browsers
- Responsive design
- Touch-friendly buttons

## 🚀 Production Deployment

1. Update redirect URIs in Google Cloud Console
2. Set environment variables in your hosting platform
3. Ensure HTTPS is enabled
4. Test the complete OAuth flow

## 🆘 Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Check that your redirect URI matches exactly in Google Cloud Console

2. **"Client ID not found"**
   - Verify your environment variables are set correctly
   - Restart your development server after adding env vars

3. **"Access blocked"**
   - Check OAuth consent screen configuration
   - Ensure test users are added for development

4. **Popup blocked**
   - Users need to allow popups for your domain
   - Consider implementing a redirect-based flow as fallback

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Google Cloud Console configuration
3. Test with different browsers
4. Check network requests in DevTools


