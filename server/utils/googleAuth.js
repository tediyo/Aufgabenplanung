// Google OAuth Configuration for Server
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '718113492631-v55nut1svg9mo39ltdmcvd3s95lk2hr3.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';

// Google OAuth URLs
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Helper function to exchange code for token
const exchangeCodeForToken = async (code) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/auth/google/callback',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to exchange code for token: ${errorData.error_description || errorData.error}`);
  }

  return response.json();
};

// Helper function to get user info from Google
const getGoogleUserInfo = async (accessToken) => {
  const response = await fetch(GOOGLE_USER_INFO_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to get user info: ${errorData.error_description || errorData.error}`);
  }

  return response.json();
};

module.exports = {
  exchangeCodeForToken,
  getGoogleUserInfo
};

