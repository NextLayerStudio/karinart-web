'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AdminPortfolioClientProps {
  portfolioCount: number;
  beautyCount: number;
  username: string;
}

export default function AdminPortfolioClient({ 
  portfolioCount, 
  beautyCount, 
  username 
}: AdminPortfolioClientProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-[#c2a4df]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Portfolio Management</p>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoggingOut ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging out...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {username}!
            </h2>
            <p className="text-white/80">
              Manage your tattoo and beauty content from here.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#c2a4df]/20 rounded-lg">
                  <svg className="w-6 h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-white/60 text-sm">Tattoo Items</p>
                  <p className="text-2xl font-bold text-white">{portfolioCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#c2a4df]/20 rounded-lg">
                  <svg className="w-6 h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-white/60 text-sm">Beauty Items</p>
                  <p className="text-2xl font-bold text-white">{beautyCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#c2a4df]/20 rounded-lg">
                  <svg className="w-6 h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-white/60 text-sm">Session Duration</p>
                  <p className="text-sm font-medium text-white">No expiration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tattoo Management</h3>
              <p className="text-white/60 mb-4">
                Add, edit, or remove tattoo portfolio items to showcase your work.
              </p>
              <button className="bg-[#5a4e8a] hover:bg-[#c2a4df] hover:text-black text-white px-4 py-2 rounded-lg transition-colors duration-300">
                Manage Tattoos
              </button>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Beauty Management</h3>
              <p className="text-white/60 mb-4">
                Organize your beauty services and permanent makeup work.
              </p>
              <button className="bg-[#5a4e8a] hover:bg-[#c2a4df] hover:text-black text-white px-4 py-2 rounded-lg transition-colors duration-300">
                Manage Beauty
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 