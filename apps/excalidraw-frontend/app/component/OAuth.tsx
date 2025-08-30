'use client';
import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { BASE_URL } from '../config';

interface OAuthProps {
  onSuccess: (token: string, user: any) => void;
  onError: (error: string) => void;
}

const OAuth: React.FC<OAuthProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState<{ google: boolean; github: boolean }>({
    google: false,
    github: false
  });

  const handleGoogleAuth = () => {
    setLoading(prev => ({ ...prev, google: true }));
    
    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&` +
      `response_type=code&` +
      `scope=email profile`,
      'google_oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setLoading(prev => ({ ...prev, google: false }));
      }
    }, 1000);

    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        clearInterval(checkClosed);
        popup?.close();
        handleOAuthResponse(event.data.user, 'google');
        window.removeEventListener('message', messageListener);
      } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
        clearInterval(checkClosed);
        popup?.close();
        setLoading(prev => ({ ...prev, google: false }));
        onError(event.data.message);
        window.removeEventListener('message', messageListener);
      }
    };
    
    window.addEventListener('message', messageListener);
  };

  const handleGitHubAuth = () => {
    setLoading(prev => ({ ...prev, github: true }));
    
    const popup = window.open(
      `https://github.com/login/oauth/authorize?` +
      `client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/github/callback')}&` +
      `scope=user:email`,
      'github_oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setLoading(prev => ({ ...prev, github: false }));
      }
    }, 1000);

    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GITHUB_OAUTH_SUCCESS') {
        clearInterval(checkClosed);
        popup?.close();
        // Use the token from the event data instead of calling handleOAuthResponse
        onSuccess(event.data.token, event.data.user);
        window.removeEventListener('message', messageListener);
      } else if (event.data.type === 'GITHUB_OAUTH_ERROR') {
        clearInterval(checkClosed);
        popup?.close();
        setLoading(prev => ({ ...prev, github: false }));
        onError(event.data.message);
        window.removeEventListener('message', messageListener);
      }
    };
    
    window.addEventListener('message', messageListener);
  };

  const handleOAuthResponse = async (userData: any, provider: 'google' | 'github') => {
    try {
      const response = await fetch(`${BASE_URL}/auth/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.token, data.user);
      } else {
        onError(data.message || 'OAuth authentication failed');
      }
    } catch (error) {
      onError('Network error during OAuth authentication');
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading.google || loading.github}
        className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading.google ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <FcGoogle className="w-5 h-5" />
        )}
        Continue with Google
      </button>

      {/* GitHub OAuth Button */}
      <button
        type="button"
        onClick={handleGitHubAuth}
        disabled={loading.google || loading.github}
        className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading.github ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <FaGithub className="w-5 h-5" />
        )}
        Continue with GitHub
      </button>
    </div>
  );
};

export default OAuth;