'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BASE_URL } from '../../../config';

export default function GitHubCallback() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');
            
            
            if (error) {
                console.error('GitHub OAuth error:', error, errorDescription);
                window.opener?.postMessage({
                    type: 'GITHUB_OAUTH_ERROR',
                    message: errorDescription || 'GitHub authentication was cancelled or failed'
                }, window.location.origin);
                window.close();
                return;
            }
            
            if (code) {
                try {
                    
                    // Send code to your backend for token exchange
                    const response = await fetch(`${BASE_URL}/auth/github/callback`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Backend authentication failed');
                    }

                    const data = await response.json();
                    
                    // Send success to parent window
                    window.opener?.postMessage({
                        type: 'GITHUB_OAUTH_SUCCESS',
                        user: data.user,
                        token: data.token
                    }, window.location.origin);
                    
                    window.close();
                } catch (error) {
                    console.error('GitHub OAuth processing error:', error);
                    window.opener?.postMessage({
                        type: 'GITHUB_OAUTH_ERROR',
                        message: error instanceof Error ? error.message : 'Failed to authenticate with GitHub'
                    }, window.location.origin);
                    window.close();
                }
            }
        };

        if (searchParams) {
            handleCallback();
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-400">Processing GitHub authentication...</p>
            </div>
        </div>
    );
}