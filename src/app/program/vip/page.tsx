import Link from 'next/link';
import {
  VIP_BENEFITS,
  vipFinePrint,
  vipFinePrintFootnotes,
  vipFinePrintIntro,
  vipHowToGet,
  vipProgramHeadline,
} from '@/app/lib/vipProgramContent';

export const metadata = {
  title: 'VIP karta — podmienky a limity | Karin Art',
  description:
    'Ako získať VIP status u Karin, aké sú výhody a aké platia podmienky a limity programu.',
};

export default function VipProgramPage() {
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
            <p className="text-[#c2a4df] text-sm uppercase tracking-widest mb-8 md:mb-10">
              {vipProgramHeadline.subtitle}
            </p>
            <h1 className="program-hero-title text-[#c2a4df] drop-shadow-lg mb-8 md:mb-10">
              <span className="program-hero-title__line">VIP</span>
              <span className="program-hero-title__line">karta</span>
            </h1>
            <p className="text-white/75 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {vipProgramHeadline.intro}
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#c2a4df] mb-4">Čo VIP oficiálne sľubuje</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {VIP_BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex gap-2.5 p-3 rounded-lg bg-[#c2a4df]/5 border border-[#c2a4df]/15"
                >
                  <span className="text-[#c2a4df] shrink-0 text-sm leading-5">✦</span>
                  <span className="text-white/80 text-sm leading-5">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#c2a4df] mb-6">Ako sa dostať k VIP</h2>
            <div className="space-y-5">
              {vipHowToGet.map((item) => (
                <div key={item.title}>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#c2a4df]/10 to-[#5a4e8a]/5 border border-[#c2a4df]/25 rounded-lg p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#c2a4df]/70 mb-2">
              Dôležité informácie
            </p>
            <h2 className="text-xl font-semibold text-[#c2a4df] mb-2">
              Podmienky a limity VIP programu
            </h2>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              {vipFinePrintIntro}
            </p>
            <div className="space-y-4">
              {vipFinePrint.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-white/10 pb-4 last:border-0 last:pb-0"
                >
                  <h3 className="text-white/90 text-sm font-medium mb-1">{item.label}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <ul className="text-white/45 text-xs mt-6 space-y-1.5 leading-relaxed list-none">
              {vipFinePrintFootnotes.map((note) => (
                <li key={note}>* {note}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="text-center bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Registrovať sa
            </Link>
            <Link
              href="/customer/login"
              className="text-center border border-[#c2a4df]/40 text-[#c2a4df] hover:bg-[#c2a4df]/10 font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Zákaznícka zóna
            </Link>
            <Link
              href="/program/ink-kredity"
              className="text-center border border-white/20 text-white/80 hover:text-white hover:border-white/40 py-3 px-8 rounded-lg transition-colors"
            >
              Ink program
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
