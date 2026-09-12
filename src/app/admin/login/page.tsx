'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (response.ok) {
        console.log('Login successful, redirecting to portfolio');
        router.push('/admin/portfolio');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-white/80 text-lg">Admin Login</p>
        </div>

        {/* Login Form */}
        <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-white text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#c2a4df] focus:ring-1 focus:ring-[#c2a4df] transition-colors"
                placeholder="Enter username"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#c2a4df] focus:ring-1 focus:ring-[#c2a4df] transition-colors"
                placeholder="Enter password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5a4e8a] hover:bg-[#c2a4df] hover:text-black text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Back to Main Page Button */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-[#c2a4df] hover:text-white transition-colors duration-300"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to main page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 