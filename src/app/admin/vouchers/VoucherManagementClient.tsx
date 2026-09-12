"use client";

import { useState } from 'react';
import Link from 'next/link';

interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses: number;
  currentUses: number;
  expiresAt: string | null;
  availableFrom: string | null;
  availableTo: string | null;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  uses: Array<{
    id: string;
    customerEmail: string;
    usedAt: string;
  }>;
}

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  maxUses: number;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  uses: Array<{
    id: string;
    customerEmail: string;
    amountUsed: number;
    usedAt: string;
  }>;
}

interface VoucherManagementClientProps {
  discountCodes: DiscountCode[];
  giftCards: GiftCard[];
}

export default function VoucherManagementClient({
  discountCodes,
  giftCards
}: VoucherManagementClientProps) {
  const [activeTab, setActiveTab] = useState<'discount' | 'gift'>('discount');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [editingGift, setEditingGift] = useState<GiftCard | null>(null);

  // Form states
  const [discountForm, setDiscountForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    maxUses: 1,
    expiresAt: '',
    availableFrom: '',
    availableTo: '',
    description: '',
    autoGenerate: true
  });

  const [giftForm, setGiftForm] = useState({
    code: '',
    amount: 0,
    maxUses: 1,
    expiresAt: '',
    description: '',
    autoGenerate: true
  });

  // Function to generate random codes
  const generateRandomCode = (prefix: string = '') => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Function to generate discount code
  const generateDiscountCode = () => {
    const prefixes = ['DC', 'DISC', 'SAVE'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return generateRandomCode(prefix);
  };

  // Function to generate gift card code
  const generateGiftCardCode = () => {
    const prefixes = ['GC', 'GIFT', 'CARD'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return generateRandomCode(prefix);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsLoggingOut(false);
  };

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDiscount 
        ? `/api/admin/discount-codes/${editingDiscount.id}`
        : '/api/admin/discount-codes';
      
      const method = editingDiscount ? 'PUT' : 'POST';
      
      // Generate code if auto-generate is enabled and we're creating a new code
      let finalCode = discountForm.code;
      if (!editingDiscount && discountForm.autoGenerate) {
        finalCode = generateDiscountCode();
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...discountForm,
          code: finalCode,
          expiresAt: discountForm.expiresAt || null,
          availableFrom: discountForm.availableFrom || null,
          availableTo: discountForm.availableTo || null
        })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Nastala chyba');
      }
    } catch (error) {
      console.error('Error saving discount code:', error);
      alert('Nastala chyba pri ukladaní');
    }
  };

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingGift 
        ? `/api/admin/gift-cards/${editingGift.id}`
        : '/api/admin/gift-cards';
      
      const method = editingGift ? 'PUT' : 'POST';
      
      // Generate code if auto-generate is enabled and we're creating a new code
      let finalCode = giftForm.code;
      if (!editingGift && giftForm.autoGenerate) {
        finalCode = generateGiftCardCode();
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...giftForm,
          code: finalCode,
          expiresAt: giftForm.expiresAt || null
        })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Nastala chyba');
      }
    } catch (error) {
      console.error('Error saving gift card:', error);
      alert('Nastala chyba pri ukladaní');
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('Naozaj chcete vymazať tento zľavový kód?')) return;
    
    try {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting discount code:', error);
      alert('Nastala chyba pri mazaní');
    }
  };

  const handleDeleteGift = async (id: string) => {
    if (!confirm('Naozaj chcete vymazať tento darčekový poukaz?')) return;
    
    try {
      const response = await fetch(`/api/admin/gift-cards/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting gift card:', error);
      alert('Nastala chyba pri mazaní');
    }
  };

  const editDiscount = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setDiscountForm({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      maxUses: discount.maxUses,
      expiresAt: discount.expiresAt ? discount.expiresAt.split('T')[0] : '',
      availableFrom: discount.availableFrom ? discount.availableFrom.split('T')[0] : '',
      availableTo: discount.availableTo ? discount.availableTo.split('T')[0] : '',
      description: discount.description || '',
      autoGenerate: false
    });
    setShowDiscountForm(true);
  };

  const editGift = (gift: GiftCard) => {
    setEditingGift(gift);
    setGiftForm({
      code: gift.code,
      amount: gift.amount,
      maxUses: gift.maxUses,
      expiresAt: gift.expiresAt ? gift.expiresAt.split('T')[0] : '',
      description: gift.description || '',
      autoGenerate: false
    });
    setShowGiftForm(true);
  };

  const resetForms = () => {
    setShowDiscountForm(false);
    setShowGiftForm(false);
    setEditingDiscount(null);
    setEditingGift(null);
    setDiscountForm({
      code: '',
      type: 'percentage',
      value: 0,
      maxUses: 1,
      expiresAt: '',
      availableFrom: '',
      availableTo: '',
      description: '',
      autoGenerate: true
    });
    setGiftForm({
      code: '',
      amount: 0,
      maxUses: 1,
      expiresAt: '',
      description: '',
      autoGenerate: true
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-[#c2a4df]/20 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#c2a4df]">Správa Kupónov</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            <Link
              href="/admin/calendar"
              className="bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Kalendár
            </Link>
            <Link
              href="/admin/appointments"
              className="bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Termíny
            </Link>
            <Link
              href="/admin/portfolio"
              className="bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Portfólio
            </Link>
            <Link
              href="/admin/marketing"
              className="bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Marketing
            </Link>
            <Link
              href="/admin/giveaway"
              className="bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Súťaž
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? 'Odhlásovanie...' : 'Odhlásiť sa'}
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-[#c2a4df]">{discountCodes.length}</div>
            <div className="text-white/60 text-sm">Zľavové kódy</div>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-[#c2a4df]">{giftCards.length}</div>
            <div className="text-white/60 text-sm">Darčekové poukazy</div>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-[#c2a4df]">
              {discountCodes.filter(d => d.isActive).length}
            </div>
            <div className="text-white/60 text-sm">Aktívne kódy</div>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-[#c2a4df]">
              {giftCards.reduce((sum, card) => sum + card.balance, 0).toFixed(2)}€
            </div>
            <div className="text-white/60 text-sm">Celkový zostatok</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-black/20 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('discount')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'discount'
                ? 'bg-[#c2a4df] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Zľavové Kódy
          </button>
          <button
            onClick={() => setActiveTab('gift')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'gift'
                ? 'bg-[#c2a4df] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Darčekové Poukazy
          </button>
        </div>

        {/* Content */}
        {activeTab === 'discount' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Zľavové Kódy</h2>
              <button
                onClick={() => setShowDiscountForm(true)}
                className="bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Pridať Kód
              </button>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="px-4 py-3 text-left">Kód</th>
                      <th className="px-4 py-3 text-left">Typ</th>
                      <th className="px-4 py-3 text-left">Hodnota</th>
                      <th className="px-4 py-3 text-left">Použitia</th>
                      <th className="px-4 py-3 text-left">Stav</th>
                      <th className="px-4 py-3 text-left">Vyprší</th>
                      <th className="px-4 py-3 text-left">Akcie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discountCodes.map((code) => (
                      <tr key={code.id} className="border-t border-white/10">
                        <td className="px-4 py-3 font-mono">{code.code}</td>
                        <td className="px-4 py-3">
                          {code.type === 'percentage' ? 'Percentá' : 'Fixná suma'}
                        </td>
                        <td className="px-4 py-3">
                          {code.type === 'percentage' ? `${code.value}%` : `${code.value}€`}
                        </td>
                        <td className="px-4 py-3">
                          {code.currentUses}/{code.maxUses}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            code.isActive ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {code.isActive ? 'Aktívny' : 'Neaktívny'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString('sk-SK') : 'Nikdy'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => editDiscount(code)}
                              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                            >
                              Upraviť
                            </button>
                            <button
                              onClick={() => handleDeleteDiscount(code.id)}
                              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                            >
                              Vymazať
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gift' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Darčekové Poukazy</h2>
              <button
                onClick={() => setShowGiftForm(true)}
                className="bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Pridať Poukaz
              </button>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="px-4 py-3 text-left">Kód</th>
                      <th className="px-4 py-3 text-left">Suma</th>
                      <th className="px-4 py-3 text-left">Zostatok</th>
                      <th className="px-4 py-3 text-left">Použitia</th>
                      <th className="px-4 py-3 text-left">Stav</th>
                      <th className="px-4 py-3 text-left">Vyprší</th>
                      <th className="px-4 py-3 text-left">Akcie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {giftCards.map((card) => (
                      <tr key={card.id} className="border-t border-white/10">
                        <td className="px-4 py-3 font-mono">{card.code}</td>
                        <td className="px-4 py-3">{card.amount}€</td>
                        <td className="px-4 py-3">{card.balance}€</td>
                        <td className="px-4 py-3">
                          {card.currentUses}/{card.maxUses}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            card.isActive ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {card.isActive ? 'Aktívny' : 'Neaktívny'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {card.expiresAt ? new Date(card.expiresAt).toLocaleDateString('sk-SK') : 'Nikdy'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => editGift(card)}
                              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                            >
                              Upraviť
                            </button>
                            <button
                              onClick={() => handleDeleteGift(card.id)}
                              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                            >
                              Vymazať
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Discount Code Form Modal */}
        {showDiscountForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] border border-[#c2a4df]/20 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                {editingDiscount ? 'Upraviť Zľavový Kód' : 'Nový Zľavový Kód'}
              </h3>
              <form onSubmit={handleDiscountSubmit} className="space-y-4">
                {!editingDiscount && (
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="autoGenerateDiscount"
                      checked={discountForm.autoGenerate}
                      onChange={(e) => setDiscountForm({...discountForm, autoGenerate: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="autoGenerateDiscount" className="text-sm">
                      Automaticky vygenerovať kód
                    </label>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kód {!editingDiscount && discountForm.autoGenerate ? '(vygeneruje sa automaticky)' : ''}
                  </label>
                  <input
                    type="text"
                    value={discountForm.code}
                    onChange={(e) => setDiscountForm({...discountForm, code: e.target.value})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                    disabled={!editingDiscount && discountForm.autoGenerate}
                    required={!discountForm.autoGenerate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Typ</label>
                  <select
                    value={discountForm.type}
                    onChange={(e) => setDiscountForm({...discountForm, type: e.target.value as 'percentage' | 'fixed'})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                  >
                    <option value="percentage">Percentá</option>
                    <option value="fixed">Fixná suma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Hodnota {discountForm.type === 'percentage' ? '(%)' : '(€)'}
                  </label>
                  <input
                    type="number"
                    step={discountForm.type === 'percentage' ? '1' : '0.01'}
                    value={discountForm.value}
                    onChange={(e) => setDiscountForm({...discountForm, value: parseFloat(e.target.value)})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max. použití</label>
                  <input
                    type="number"
                    value={discountForm.maxUses}
                    onChange={(e) => setDiscountForm({...discountForm, maxUses: parseInt(e.target.value)})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vyprší</label>
                  <input
                    type="date"
                    value={discountForm.expiresAt}
                    onChange={(e) => setDiscountForm({...discountForm, expiresAt: e.target.value})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Platný od</label>
                    <input
                      type="date"
                      value={discountForm.availableFrom}
                      onChange={(e) => setDiscountForm({...discountForm, availableFrom: e.target.value})}
                      className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Platný do</label>
                    <input
                      type="date"
                      value={discountForm.availableTo}
                      onChange={(e) => setDiscountForm({...discountForm, availableTo: e.target.value})}
                      className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Popis</label>
                  <textarea
                    value={discountForm.description}
                    onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white py-2 rounded transition-colors"
                  >
                    {editingDiscount ? 'Upraviť' : 'Vytvoriť'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForms}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded transition-colors"
                  >
                    Zrušiť
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Gift Card Form Modal */}
        {showGiftForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] border border-[#c2a4df]/20 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                {editingGift ? 'Upraviť Darčekový Poukaz' : 'Nový Darčekový Poukaz'}
              </h3>
              <form onSubmit={handleGiftSubmit} className="space-y-4">
                {!editingGift && (
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="autoGenerateGift"
                      checked={giftForm.autoGenerate}
                      onChange={(e) => setGiftForm({...giftForm, autoGenerate: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="autoGenerateGift" className="text-sm">
                      Automaticky vygenerovať kód
                    </label>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kód {!editingGift && giftForm.autoGenerate ? '(vygeneruje sa automaticky)' : ''}
                  </label>
                  <input
                    type="text"
                    value={giftForm.code}
                    onChange={(e) => setGiftForm({...giftForm, code: e.target.value})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                    disabled={!editingGift && giftForm.autoGenerate}
                    required={!giftForm.autoGenerate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Suma (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={giftForm.amount}
                    onChange={(e) => setGiftForm({...giftForm, amount: parseFloat(e.target.value)})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max. použití</label>
                  <input
                    type="number"
                    value={giftForm.maxUses}
                    onChange={(e) => setGiftForm({...giftForm, maxUses: parseInt(e.target.value)})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vyprší</label>
                  <input
                    type="date"
                    value={giftForm.expiresAt}
                    onChange={(e) => setGiftForm({...giftForm, expiresAt: e.target.value})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Popis</label>
                  <textarea
                    value={giftForm.description}
                    onChange={(e) => setGiftForm({...giftForm, description: e.target.value})}
                    className="w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white py-2 rounded transition-colors"
                  >
                    {editingGift ? 'Upraviť' : 'Vytvoriť'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForms}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded transition-colors"
                  >
                    Zrušiť
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 