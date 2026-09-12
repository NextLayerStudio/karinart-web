'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MarketingEmail {
  id: string;
  email: string;
  createdAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export default function AdminMarketing() {
  const [marketingEmails, setMarketingEmails] = useState<MarketingEmail[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [emailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Novinky a akcie',
      subject: 'Novinky z Karin Art - Špeciálne ponuky pre Vás!',
      body: `Dobrý deň,

dúfame, že sa máte dobre! Chceli by sme Vás informovať o najnovších novinkách a špeciálnych ponukách z Karin Art.

{message}

Tešíme sa na Vašu návštevu!

S pozdravom,
Karin Art
info@karinart.sk`
    },
    {
      id: '2',
      name: 'Sezónne ponuky',
      subject: 'Sezónne ponuky - Karin Art',
      body: `Dobrý deň,

prichádza nová sezóna a s ňou aj špeciálne ponuky pre naše verné zákazníky!

{message}

Neváhajte nás kontaktovať pre rezerváciu termínu.

S pozdravom,
Karin Art
info@karinart.sk`
    },
    {
      id: '3',
      name: 'Vlastná správa',
      subject: '',
      body: ''
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('1');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [emailStats, setEmailStats] = useState({
    total: 0,
    selected: 0
  });
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

  // Fetch marketing emails
  const fetchMarketingEmails = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/marketing/emails');
      if (response.ok) {
        const data = await response.json();
        setMarketingEmails(data);
        setEmailStats({
          total: data.length,
          selected: selectedEmails.length
        });
      }
    } catch (error) {
      console.error('Error fetching marketing emails:', error);
      setMessage('Chyba pri načítaní emailov');
    }
  }, [selectedEmails.length]);

  // Load emails on component mount
  useEffect(() => {
    fetchMarketingEmails();
  }, [fetchMarketingEmails]);

  // Update stats when selection changes
  useEffect(() => {
    setEmailStats({
      total: marketingEmails.length,
      selected: selectedEmails.length
    });
  }, [selectedEmails, marketingEmails]);

  // Handle email selection
  const handleEmailSelection = (emailId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails(prev => [...prev, emailId]);
    } else {
      setSelectedEmails(prev => prev.filter(id => id !== emailId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(marketingEmails.map(email => email.id));
    } else {
      setSelectedEmails([]);
    }
  };

  // Send marketing emails
  const sendMarketingEmails = async () => {
    if (selectedEmails.length === 0) {
      setMessage('Vyberte aspoň jeden email');
      return;
    }

    const template = emailTemplates.find(t => t.id === selectedTemplate);
    if (!template) {
      setMessage('Vyberte šablónu emailu');
      return;
    }

    const subject = selectedTemplate === '3' ? customSubject : template.subject;
    const message = selectedTemplate === '3' ? customMessage : customMessage;

    if (!subject.trim()) {
      setMessage('Zadajte predmet emailu');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/marketing/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailIds: selectedEmails,
          subject: subject,
          message: message,
          templateId: selectedTemplate
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`Emaily odoslané: ${result.sent}/${result.total}`);
        setSelectedEmails([]);
        setCustomSubject('');
        setCustomMessage('');
      } else {
        const error = await response.json();
        setMessage(`Chyba: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending marketing emails:', error);
      setMessage('Chyba pri odosielaní emailov');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete selected emails
  const deleteSelectedEmails = async () => {
    if (selectedEmails.length === 0) {
      setMessage('Vyberte aspoň jeden email na vymazanie');
      return;
    }

    if (!confirm(`Naozaj chcete vymazať ${selectedEmails.length} emailov?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/marketing/emails', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailIds: selectedEmails
        }),
      });

      if (response.ok) {
        setMessage(`${selectedEmails.length} emailov bolo vymazaných`);
        setSelectedEmails([]);
        fetchMarketingEmails(); // Refresh the list
      } else {
        const error = await response.json();
        setMessage(`Chyba: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting emails:', error);
      setMessage('Chyba pri mazaní emailov');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">

          {message && (
            <div className="mb-6 p-4 bg-[#c2a4df]/20 border border-[#c2a4df]/40 rounded-lg text-center">
              <p className="text-[#c2a4df]">{message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Email List */}
            <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Marketingové emaily</h3>
                <div className="text-white/60 text-sm">
                  {emailStats.selected} / {emailStats.total} vybraných
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={() => handleSelectAll(true)}
                  className="bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white px-3 py-1 rounded-lg transition-colors text-sm"
                >
                  Vybrať všetky
                </button>
                <button
                  onClick={() => handleSelectAll(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                >
                  Zrušiť výber
                </button>
                <button
                  onClick={deleteSelectedEmails}
                  disabled={isLoading || selectedEmails.length === 0}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                  {isLoading ? 'Mazanie...' : 'Vymazať vybrané'}
                </button>
              </div>

              {/* Email List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {marketingEmails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg border border-[#c2a4df]/10"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email.id)}
                      onChange={(e) => handleEmailSelection(email.id, e.target.checked)}
                      className="w-4 h-4 text-[#c2a4df] bg-black border-[#c2a4df]/30 rounded focus:ring-[#c2a4df] focus:ring-2"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{email.email}</p>
                      <p className="text-white/60 text-sm">
                        Pridané: {new Date(email.createdAt).toLocaleDateString('sk-SK')}
                      </p>
                    </div>
                  </div>
                ))}
                {marketingEmails.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    Žiadne marketingové emaily
                  </div>
                )}
              </div>
            </div>

            {/* Email Composer */}
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Vytvoriť email</h3>

              {/* Template Selection */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Šablóna</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-black border border-[#c2a4df]/30 rounded-lg px-3 py-2 text-white focus:ring-[#c2a4df] focus:ring-2"
                >
                  {emailTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Subject */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Predmet</label>
                <input
                  type="text"
                  value={selectedTemplate === '3' ? customSubject : emailTemplates.find(t => t.id === selectedTemplate)?.subject || ''}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  disabled={selectedTemplate !== '3'}
                  className="w-full bg-black border border-[#c2a4df]/30 rounded-lg px-3 py-2 text-white focus:ring-[#c2a4df] focus:ring-2 disabled:opacity-50"
                  placeholder="Zadajte predmet emailu"
                />
              </div>

              {/* Custom Message */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Správa</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={6}
                  className="w-full bg-black border border-[#c2a4df]/30 rounded-lg px-3 py-2 text-white focus:ring-[#c2a4df] focus:ring-2 resize-none"
                  placeholder="Zadajte obsah správy..."
                />
              </div>

              {/* Send Button */}
              <button
                onClick={sendMarketingEmails}
                disabled={isLoading || selectedEmails.length === 0}
                className="w-full bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Odosielanie...' : `Odoslať (${selectedEmails.length})`}
              </button>

              {/* Preview */}
              {selectedTemplate !== '3' && emailTemplates.find(t => t.id === selectedTemplate) && (
                <div className="mt-6 p-4 bg-black/20 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Náhľad</h4>
                  <div className="text-white/80 text-sm">
                    <p className="font-medium mb-2">
                      {emailTemplates.find(t => t.id === selectedTemplate)?.subject}
                    </p>
                    <p className="whitespace-pre-line">
                      {emailTemplates.find(t => t.id === selectedTemplate)?.body.replace('{message}', customMessage || '[Vaša správa]')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 