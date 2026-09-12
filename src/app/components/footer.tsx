import Link from "next/link";
import { FaInstagram, FaFacebook, FaMapMarkerAlt, FaPhone, FaEnvelope, FaIdCard } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="site-footer text-white text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0">
          <div className="flex flex-col items-center text-center md:px-6 lg:px-8">
            <h3 className="text-[#c2a4df] font-semibold mb-4 text-sm sm:text-base tracking-wide">
              Rýchle odkazy
            </h3>
            <ul className="space-y-2.5 mb-5">
              <li>
                <Link href="/tattoo" className="text-white/75 hover:text-[#c2a4df] transition-colors">
                  Domov
                </Link>
              </li>
              <li>
                <Link href="/tattoo/about" className="text-white/75 hover:text-[#c2a4df] transition-colors">
                  O mne
                </Link>
              </li>
              <li>
                <Link href="/tattoo/portfolio" className="text-white/75 hover:text-[#c2a4df] transition-colors">
                  Portfólio
                </Link>
              </li>
              <li>
                <Link href="/tattoo/services" className="text-white/75 hover:text-[#c2a4df] transition-colors">
                  Služby
                </Link>
              </li>
              <li>
                <Link href="/tattoo/contact" className="text-white/75 hover:text-[#c2a4df] transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/volne-navrhy" className="text-white/75 hover:text-[#c2a4df] transition-colors">
                  Voľné návrhy
                </Link>
              </li>
            </ul>
            <Link href="/appointment" className="site-footer__cta no-underline">
              Zarezervovať termín
            </Link>
          </div>

          <div className="flex flex-col items-center text-center md:border-x md:border-white/10 md:px-6 lg:px-8">
            <h3 className="text-[#c2a4df] font-semibold mb-4 text-sm sm:text-base tracking-wide">
              Kontakt
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-center justify-center gap-2 text-white/80">
                <FaIdCard className="text-[#c2a4df] w-4 h-4 flex-shrink-0" />
                <span>Karin Haizerová</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <FaMapMarkerAlt className="text-[#c2a4df] w-4 h-4 flex-shrink-0" />
                <a
                  href="https://www.google.com/maps/search/Ondavsk%C3%A1+1+Bratislava?hl=sk&entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/75 hover:text-[#c2a4df] transition-colors"
                >
                  Ondavská 1, Bratislava
                </a>
              </li>
              <li className="flex items-center justify-center gap-2">
                <FaPhone className="text-[#c2a4df] w-4 h-4 flex-shrink-0" />
                <a href="tel:+421902482967" className="text-white/75 hover:text-[#c2a4df] transition-colors">
                  +421 902 482 967
                </a>
              </li>
              <li className="flex items-center justify-center gap-2">
                <FaEnvelope className="text-[#c2a4df] w-4 h-4 flex-shrink-0" />
                <a
                  href="mailto:info@karinart.sk"
                  className="text-white/75 hover:text-[#c2a4df] transition-colors break-all"
                >
                  info@karinart.sk
                </a>
              </li>
              <li className="flex items-center justify-center gap-2 text-white/60">
                <FaIdCard className="text-[#c2a4df] w-4 h-4 flex-shrink-0" />
                <span>IČO: 56580894</span>
              </li>
              <li className="text-[10px] sm:text-xs text-white/40 mt-3 leading-relaxed">
                <p>Zapísaný v: Živnostenskom registri</p>
                <p>Okresného úradu Senec</p>
                <p>Číslo živnostenského registra: 140-35375</p>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center text-center md:px-6 lg:px-8">
            <h3 className="text-[#c2a4df] font-semibold mb-4 text-sm sm:text-base tracking-wide">
              Sociálne siete
            </h3>
            <div className="flex flex-col items-center gap-3">
              <a
                href="https://www.instagram.com/karin_art_tattoo?igsh=N3lqejRsenR5MWd0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/75 hover:text-[#c2a4df] transition-colors"
              >
                <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>@karin_art_tattoo</span>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61560932097231"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/75 hover:text-[#c2a4df] transition-colors"
              >
                <FaFacebook className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Karin Art Tattoo</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-center">
            <div className="flex flex-col md:flex-row md:items-center justify-center gap-2 md:gap-4 text-[10px] sm:text-xs text-white/40">
              <p>&copy; 2025 Karin Art Tattoo. Všetky práva vyhradené.</p>
              <Link href="/gdpr" className="hover:text-[#c2a4df] transition-colors">
                GDPR
              </Link>
            </div>
            <a
              href="https://nextlayer.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs text-white/40 hover:text-[#c2a4df] transition-colors"
            >
              Site powered by NextLayer Studio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
