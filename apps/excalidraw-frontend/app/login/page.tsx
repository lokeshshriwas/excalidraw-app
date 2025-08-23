'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BASE_URL } from '../config';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/auth/signin`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push('/joinRoom');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 pointer-events-none" />
      
      {/* Login container */}
      <div className="w-full max-w-md relative">
        {/* Logo/Brand section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-sm" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to your account</p>
        </div>

        {/* Login form */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1a1a] text-gray-400">Don't have an account?</span>
              </div>
            </div>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
              Create account
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}