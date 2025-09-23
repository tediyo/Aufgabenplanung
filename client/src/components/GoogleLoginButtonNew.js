import React, { useEffect, useRef } from 'react';

const GoogleLoginButtonNew = ({ onSuccess, onError, text = "Continue with Google", className = "", disabled = false }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Wait for Google Identity Services to load
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: '123456789-abcdefghijklmnop.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the button
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: '100%',
            disabled: disabled
          });
        }
      } else {
        // Retry after a short delay if Google Identity Services hasn't loaded yet
        setTimeout(initializeGoogleSignIn, 100);
      }
    };

    const handleCredentialResponse = (response) => {
      try {
        // Decode the JWT token to get user info
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        
        const user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          provider: 'google',
          credential: response.credential
        };

        onSuccess(user);
      } catch (error) {
        console.error('Error parsing Google credential:', error);
        onError('Failed to process Google authentication');
      }
    };

    // Initialize when component mounts
    initializeGoogleSignIn();

    // Cleanup
    return () => {
      if (window.google && window.google.accounts && buttonRef.current) {
        window.google.accounts.id.cancel();
      }
    };
  }, [onSuccess, onError, disabled]);

  return (
    <div className={`w-full ${className}`}>
      <div ref={buttonRef} className="w-full"></div>
    </div>
  );
};

export default GoogleLoginButtonNew;
