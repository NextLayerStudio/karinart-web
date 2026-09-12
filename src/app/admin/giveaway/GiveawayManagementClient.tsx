'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GiveawayEntry {
  id: string;
  fullName: string;
  email: string;
  instagram: string | null;
  agreeMarketing: boolean;
  agreePrivacy: boolean;
  confirmAdult: boolean;
  createdAt: string;
}

interface GiveawayManagementClientProps {
  entries: GiveawayEntry[];
}

export default function GiveawayManagementClient({
  entries
}: GiveawayManagementClientProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadCSV = () => {
    const headers = ['Meno', 'Email', 'Instagram', 'Dátum prihlásenia'];
    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [
        `"${entry.fullName}"`,
        `"${entry.email}"`,
        `"${entry.instagram || ''}"`,
        `"${formatDate(entry.createdAt)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sutaz_prihlasky_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Správa Súťaže
            </h2>
            <p className="text-white/80">
              Spravujte prihlášky do súťaží o tetovanie.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-[#c2a4df]/20 rounded-lg">
                  <svg className="w-6 h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/60">Celkové prihlášky</p>
                  <p className="text-2xl font-bold text-white">{entries.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-[#c2a4df]/20 rounded-lg">
                  <svg className="w-6 h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/60">Aktívne súťaže</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-[#c2a4df]/20 rounded-lg">
                  <svg className="w-6 h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/60">Posledná aktualizácia</p>
                  <p className="text-2xl font-bold text-white">Dnes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={downloadCSV}
              className="bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Stiahnuť CSV
            </button>
          </div>

          {/* Entries Table */}
          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#c2a4df]/20">
              <h3 className="text-lg font-semibold text-white">Prihlášky do súťaže</h3>
            </div>
            
            {entries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Meno</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Instagram</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Dátum prihlásenia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c2a4df]/10">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-black/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{entry.fullName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/80">{entry.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/80">{entry.instagram ? `@${entry.instagram}` : '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/80">{formatDate(entry.createdAt)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-white/60">
                Žiadne prihlásenia do súťaže
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}