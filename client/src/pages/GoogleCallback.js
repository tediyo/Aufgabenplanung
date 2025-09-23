import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        console.log('Mobile OAuth Debug:', {
          code: code ? 'Present' : 'Missing',
          error: error || 'None',
          userAgent: navigator.userAgent,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        });

        if (error) {
          throw new Error(`Google authentication failed: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Send code to server for processing
        console.log('Sending code to server:', code);
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? 'https://aufgabenplanung.onrender.com/api/auth/google'
          : 'http://localhost:5000/api/auth/google';
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('Server response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error(errorData.message || 'Failed to authenticate with Google');
        }

        const data = await response.json();
        console.log('Server response data:', data);

        // Create user object
        const user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          picture: data.user.picture,
          provider: 'google',
          isGoogleUser: data.user.isGoogleUser
        };

        // Store user data and token
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.user.email);

        console.log('Mobile OAuth Success:', {
          user: user.email,
          hasToken: !!data.token,
          redirecting: 'to dashboard'
        });

        // Redirect to dashboard with a small delay for mobile
        setTimeout(() => {
          try {
            navigate('/dashboard');
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback: direct window location change
            window.location.href = '/dashboard';
          }
        }, 500);

      } catch (error) {
        console.error('Google OAuth error:', error);
        
        // Redirect to login with error
        navigate('/login?error=' + encodeURIComponent(error.message));
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-orange-400 to-yellow-400">
      <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md w-full mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Google Sign-In</h2>
        <p className="text-gray-600">Please wait while we complete your authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
