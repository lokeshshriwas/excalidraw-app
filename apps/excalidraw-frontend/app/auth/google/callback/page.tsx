'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            
            if (error) {
                window.opener?.postMessage({
                    type: 'GOOGLE_OAUTH_ERROR',
                    message: 'Google authentication was cancelled or failed'
                }, window.location.origin);
                window.close();
                return;
            }
            
            if (code) {
                try {
                    // Exchange code for access token
                    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            code,
                            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                            client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
                            redirect_uri: window.location.origin + '/auth/google/callback',
                            grant_type: 'authorization_code'
                        })
                    });
                    
                    const tokens = await tokenResponse.json();
                    
                    // Get user info
                    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
                    const userInfo = await userResponse.json();
                    
                    // Send to parent window
                    window.opener?.postMessage({
                        type: 'GOOGLE_OAUTH_SUCCESS',
                        user: {
                            email: userInfo.email,
                            name: userInfo.name,
                            avatar: userInfo.picture
                        }
                    }, window.location.origin);
                    
                    window.close();
                } catch (error) {
                    console.error('OAuth error:', error);
                    window.opener?.postMessage({
                        type: 'GOOGLE_OAUTH_ERROR',
                        message: 'Failed to authenticate with Google'
                    }, window.location.origin);
                    window.close();
                }
            }
        };

        handleCallback();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-400">Processing Google authentication...</p>
            </div>
        </div>
    );
}