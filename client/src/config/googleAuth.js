// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = '718113492631-v55nut1svg9mo39ltdmcvd3s95lk2hr3.apps.googleusercontent.com';

// Google OAuth Scopes
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Google OAuth Configuration Object
export const GOOGLE_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  scope: GOOGLE_SCOPES.join(' '),
  redirectUri: window.location.origin + '/auth/google/callback',
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};

// Google OAuth URLs
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Helper function to build Google OAuth URL
export const buildGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CONFIG.redirectUri,
    response_type: GOOGLE_CONFIG.responseType,
    scope: GOOGLE_CONFIG.scope,
    access_type: GOOGLE_CONFIG.accessType,
    prompt: GOOGLE_CONFIG.prompt,
    state: Math.random().toString(36).substring(7) // CSRF protection
  });
  
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

// Helper function to exchange code for token
export const exchangeCodeForToken = async (code) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: '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',
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_CONFIG.redirectUri,
    }),
  });
  
  return response.json();
};

// Helper function to get user info from Google
export const getGoogleUserInfo = async (accessToken) => {
  const response = await fetch(GOOGLE_USER_INFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  return response.json();
};
