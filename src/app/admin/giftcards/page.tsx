import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminGiftCards() {
  const giftCards = await prisma.giftCard.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      uses: true,
    }
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="bg-black/40 backdrop-blur-md border-b border-[#c2a4df]/20 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#c2a4df]">Darčekové Poukážky</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-4 py-3 text-left">Kód</th>
                  <th className="px-4 py-3 text-left">Hodnota</th>
                  <th className="px-4 py-3 text-left">Zostatok</th>
                  <th className="px-4 py-3 text-left">Použitia</th>
                  <th className="px-4 py-3 text-left">Stav</th>
                  <th className="px-4 py-3 text-left">Vytvorené</th>
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
                      {new Date(card.createdAt).toLocaleDateString('sk-SK')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}