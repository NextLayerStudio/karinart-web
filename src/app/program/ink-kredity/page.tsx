import Link from 'next/link';
import {
  INK_CREDITS_PER_ACTIVATION,
  INK_CREDIT_EURO_VALUE,
  inkProgramSteps,
  inkProgramFaq,
} from '@/app/lib/inkProgramContent';
import { isInkProgramEnabled } from '@/app/lib/siteSettings';

export const metadata = {
  title: 'Ink program — ako zbierat kredity | Karin Art',
  description:
    'Zisti, ako funguje ink program v Karin Art — registrácia, pozývanie priateľov, aktivácia pozvaných a zbieranie ink kreditov.',
};

export default async function InkKredityPage() {
  const enabled = await isInkProgramEnabled();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative w-full py-20 md:py-28 px-4">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(/images/studio.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-10">
          <div className="text-center">
            <p className="text-[#c2a4df] text-sm uppercase tracking-widest mb-2">Letná akcia</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-amsterdam-four text-[#c2a4df] mb-4">
              Ink program
            </h1>
            <p className="text-white/75 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Pozvi priateľov do Karin Art. Keď sa tvoj pozvaný po termíne aktivuje predložením QR
              kódu, získaš{' '}
              <span className="text-[#c2a4df] font-semibold">
                {INK_CREDITS_PER_ACTIVATION} ink ({INK_CREDIT_EURO_VALUE} € zľava)
              </span>
              . Za každého pozvaného len raz.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-5 text-center">
              <p className="text-3xl font-bold text-[#c2a4df]">{INK_CREDITS_PER_ACTIVATION}</p>
              <p className="text-white/50 text-xs mt-1">ink za aktivovaného pozvaného</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-5 text-center">
              <p className="text-3xl font-bold text-white">{INK_CREDIT_EURO_VALUE} €</p>
              <p className="text-white/50 text-xs mt-1">hodnota 100 ink</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-5 text-center">
              <p className="text-3xl font-bold text-white">1×</p>
              <p className="text-white/50 text-xs mt-1">za každého pozvaného</p>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#c2a4df] mb-6">Ako sa zapojiť</h2>
            <ol className="space-y-6">
              {inkProgramSteps.map((item) => (
                <li key={item.step} className="flex gap-4">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-[#c2a4df]/15 border border-[#c2a4df]/40 flex items-center justify-center text-[#c2a4df] font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-white/65 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gradient-to-br from-[#c2a4df]/15 to-[#5a4e8a]/10 border border-[#c2a4df]/30 rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#c2a4df] mb-3">Dôležité — QR kód po termíne</h2>
            <p className="text-white/75 text-sm leading-relaxed mb-4">
              Aktivácia pozvaného prebehne len vtedy, keď{' '}
              <strong className="text-white">po skončení termínu predloží svoj QR kód</strong> zo
              zákazníckej zóny. Bez toho sa pozvaný neaktivuje a ty nedostaneš ink kredity.
            </p>
            <ul className="text-white/65 text-sm space-y-2 list-disc list-inside">
              <li>QR kód je v zákazníckej zóne vždy viditeľný po prihlásení</li>
              <li>Pozvaný ho ukáže na telefóne hneď po skončení termínu</li>
              <li>Za jedného pozvaného získaš ink kredity iba raz — pri prvej aktivácii</li>
            </ul>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#c2a4df] mb-4">Časté otázky</h2>
            <div className="space-y-4">
              {inkProgramFaq.map((item) => (
                <div key={item.q} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <h3 className="text-white font-medium text-sm mb-1">{item.q}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {!enabled && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
              <p className="text-yellow-400 text-sm">
                Registrácia nových účastníkov je momentálne pozastavená. Existujúci účastníci
                môžu program naďalej používať.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {enabled && (
              <Link
                href="/register"
                className="text-center bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Registrovať sa
              </Link>
            )}
            <Link
              href="/customer/login"
              className="text-center border border-[#c2a4df]/40 text-[#c2a4df] hover:bg-[#c2a4df]/10 font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Prihlásiť sa
            </Link>
            <Link
              href="/program/vip"
              className="text-center border border-white/20 text-white/80 hover:text-white hover:border-white/40 py-3 px-8 rounded-lg transition-colors"
            >
              VIP karta
            </Link>
            <Link
              href="/program/summer-leaderboard"
              className="text-center border border-white/20 text-white/80 hover:text-white hover:border-white/40 py-3 px-8 rounded-lg transition-colors"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
