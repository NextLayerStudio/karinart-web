'use client';

import { useEffect, useState } from 'react';

interface BeautyPriceRow {
  serviceId: string;
  title: string;
  categorySlug: string;
  priceEUR: number | null;
  durationHours: number;
}

const categoryLabels: Record<string, string> = {
  laminacia: 'Laminácia',
  'osetrenia-pleti': 'Ošetrenia pleti',
};

export default function AdminBeautyPricingPage() {
  const [services, setServices] = useState<BeautyPriceRow[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadServices = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/beauty-prices');
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Nepodarilo sa načítať ceny');
        return;
      }

      setServices(result.services);
    } catch {
      setError('Nastala chyba pri načítaní cien');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const updateRow = (
    serviceId: string,
    field: 'priceEUR' | 'durationHours',
    value: string
  ) => {
    setServices((current) =>
      current.map((service) => {
        if (service.serviceId !== serviceId) {
          return service;
        }

        if (field === 'priceEUR') {
          const trimmed = value.trim();
          return {
            ...service,
            priceEUR: trimmed === '' ? null : Number(trimmed),
          };
        }

        return {
          ...service,
          durationHours: Number(value),
        };
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/beauty-prices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: services.map((service) => ({
            serviceId: service.serviceId,
            priceEUR: service.priceEUR,
            durationHours: service.durationHours,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Nepodarilo sa uložiť ceny');
        return;
      }

      setServices(result.services);
      setMessage('Ceny boli úspešne uložené. Zmeny sa okamžite prejavia na webe.');
    } catch {
      setError('Nastala chyba pri ukladaní cien');
    } finally {
      setIsSaving(false);
    }
  };

  const grouped = services.reduce<Record<string, BeautyPriceRow[]>>((acc, service) => {
    if (!acc[service.categorySlug]) {
      acc[service.categorySlug] = [];
    }
    acc[service.categorySlug].push(service);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Beauty cenník</h1>
          <p className="text-gray-400 mt-2">
            Upravte ceny a trvanie služieb. Prázdna cena znamená individuálnu cenu.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="px-5 py-2.5 rounded-lg bg-white text-black font-medium disabled:opacity-50"
        >
          {isSaving ? 'Ukladám...' : 'Uložiť zmeny'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-green-200">
          {message}
        </div>
      )}

      {isLoading && <p className="text-gray-400">Načítavam cenník...</p>}

      {!isLoading && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([categorySlug, rows]) => (
            <section key={categorySlug} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-xl font-semibold">
                  {categoryLabels[categorySlug] ?? categorySlug}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-400">
                    <tr>
                      <th className="px-5 py-3">Služba</th>
                      <th className="px-5 py-3">Cena (€)</th>
                      <th className="px-5 py-3">Trvanie (hod.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((service) => (
                      <tr key={service.serviceId} className="border-t border-white/10">
                        <td className="px-5 py-4 font-medium">{service.title}</td>
                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={service.priceEUR ?? ''}
                            placeholder="Individuálna"
                            onChange={(event) =>
                              updateRow(service.serviceId, 'priceEUR', event.target.value)
                            }
                            className="w-32 rounded-lg bg-black/40 border border-white/20 px-3 py-2"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="0.5"
                            max="8"
                            step="0.5"
                            value={service.durationHours}
                            onChange={(event) =>
                              updateRow(service.serviceId, 'durationHours', event.target.value)
                            }
                            className="w-32 rounded-lg bg-black/40 border border-white/20 px-3 py-2"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
