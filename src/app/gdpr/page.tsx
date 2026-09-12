'use client';

import { useState } from "react";

export default function GDPRPage() {
  const [language, setLanguage] = useState<'sk' | 'en'>('sk');

  const content = {
    sk: {
      title: "Ochrana osobných údajov (GDPR)",
      subtitle: "Vaše súkromie je našou prioritou",
      intro: "Vaše súkromie je pre nás dôležité. Pri návšteve tejto webovej stránky dbáme na ochranu vašich osobných údajov v súlade s Nariadením Európskeho parlamentu a Rady (EÚ) 2016/679 (GDPR).",
      sections: {
        dataCollection: {
          title: "Aké údaje zbierame",
          intro: "Naša stránka nezbiera žiadne osobné údaje bez vášho súhlasu. Osobné údaje nám poskytujete len v prípade, že nás kontaktujete prostredníctvom kontaktného formulára alebo e-mailom.",
          listIntro: "Môžeme spracúvať tieto údaje:",
          items: [
            "meno a priezvisko",
            "e-mailová adresa",
            "telefónne číslo",
            "prípadné ďalšie informácie, ktoré nám dobrovoľne poskytnete"
          ]
        },
        purpose: {
          title: "Účel spracovania údajov",
          intro: "Vaše údaje spracúvame výhradne za účelom:",
          items: [
            "odpovede na vaše otázky a dopyty",
            "rezervácie služieb",
            "zabezpečenia komunikácie"
          ]
        },
        protection: {
          title: "Ako chránime vaše údaje",
          content: "Vaše údaje uchovávame bezpečne a neposkytujeme ich tretím stranám bez vášho výslovného súhlasu, s výnimkou zákonom stanovených prípadov."
        },
        retention: {
          title: "Doba uchovávania údajov",
          content: "Vaše údaje uchovávame len po dobu nevyhnutne potrebnú na naplnenie účelu, na ktorý boli získané, alebo v súlade s platnými právnymi predpismi."
        },
        rights: {
          title: "Vaše práva",
          intro: "V súlade s GDPR máte právo:",
          items: [
            "požiadať o prístup k vašim údajom",
            "opraviť nepresné údaje",
            "vymazať údaje, ak už nie sú potrebné",
            "obmedziť spracovanie",
            "namietať proti spracovaniu",
            "podať sťažnosť dozornému orgánu"
          ]
        },
        contact: {
          title: "Kontakt",
          content: "Ak máte akékoľvek otázky týkajúce sa ochrany vašich údajov, kontaktujte nás na:"
        }
      }
    },
    en: {
      title: "Privacy Policy (GDPR)",
      subtitle: "Your privacy is our priority",
      intro: "Your privacy is important to us. When visiting this website, we ensure the protection of your personal data in accordance with Regulation (EU) 2016/679 (GDPR).",
      sections: {
        dataCollection: {
          title: "What data we collect",
          intro: "Our website does not collect any personal data without your consent. You provide personal data only when you contact us through the contact form or email.",
          listIntro: "We may process the following data:",
          items: [
            "name and surname",
            "email address",
            "phone number",
            "any additional information you voluntarily provide"
          ]
        },
        purpose: {
          title: "Purpose of data processing",
          intro: "We process your data exclusively for:",
          items: [
            "responding to your questions and inquiries",
            "service reservations",
            "ensuring communication"
          ]
        },
        protection: {
          title: "How we protect your data",
          content: "We store your data securely and do not provide it to third parties without your explicit consent, except as required by law."
        },
        retention: {
          title: "Data retention period",
          content: "We retain your data only for the time necessary to fulfill the purpose for which it was obtained, or in accordance with applicable legal regulations."
        },
        rights: {
          title: "Your rights",
          intro: "In accordance with GDPR, you have the right to:",
          items: [
            "request access to your data",
            "correct inaccurate data",
            "delete data if no longer needed",
            "restrict processing",
            "object to processing",
            "file a complaint with the supervisory authority"
          ]
        },
        contact: {
          title: "Contact",
          content: "If you have any questions regarding the protection of your data, please contact us at:"
        }
      }
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-black text-white">      <div className="relative">
        <div className="relative z-10 px-4 py-8 md:py-12 mt-20 sm:mt-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl text-[#c2a4df] mb-4">
                {currentContent.title}
              </h1>
              <p className="text-lg text-gray-300 mb-6">
                {currentContent.subtitle}
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setLanguage('sk')}
                  className={`px-4 py-2 rounded ${language === 'sk' ? 'bg-[#c2a4df] text-black' : 'bg-transparent border border-[#c2a4df] text-[#c2a4df]'}`}
                >
                  Slovensky
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded ${language === 'en' ? 'bg-[#c2a4df] text-black' : 'bg-transparent border border-[#c2a4df] text-[#c2a4df]'}`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-gray-300">
                {currentContent.intro}
              </p>

              <div className="space-y-6">
                <div className="border border-[#2E2E2E] rounded-lg p-6">
                  <h2 className="text-2xl font-medium text-[#c2a4df] mb-4">{currentContent.sections.dataCollection.title}</h2>
                  <p className="mb-4">
                    {currentContent.sections.dataCollection.intro}
                  </p>
                  <p className="mb-2">{currentContent.sections.dataCollection.listIntro}</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {currentContent.sections.dataCollection.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-[#2E2E2E] rounded-lg p-6">
                  <h2 className="text-2xl font-medium text-[#c2a4df] mb-4">{currentContent.sections.purpose.title}</h2>
                  <p className="mb-2">{currentContent.sections.purpose.intro}</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {currentContent.sections.purpose.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-[#2E2E2E] rounded-lg p-6">
                  <h2 className="text-2xl font-medium text-[#c2a4df] mb-4">{currentContent.sections.protection.title}</h2>
                  <p>
                    {currentContent.sections.protection.content}
                  </p>
                </div>

                <div className="border border-[#2E2E2E] rounded-lg p-6">
                  <h2 className="text-2xl font-medium text-[#c2a4df] mb-4">{currentContent.sections.retention.title}</h2>
                  <p>
                    {currentContent.sections.retention.content}
                  </p>
                </div>

                <div className="border border-[#2E2E2E] rounded-lg p-6">
                  <h2 className="text-2xl font-medium text-[#c2a4df] mb-4">{currentContent.sections.rights.title}</h2>
                  <p className="mb-2">{currentContent.sections.rights.intro}</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {currentContent.sections.rights.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-[#2E2E2E] rounded-lg p-6">
                  <h2 className="text-2xl font-medium text-[#c2a4df] mb-4">{currentContent.sections.contact.title}</h2>
                  <p className="mb-2">{currentContent.sections.contact.content}</p>
                  <a 
                    href="mailto:karin.art.tattoo1@gmail.com" 
                    className="text-[#c2a4df] hover:text-white transition-colors inline-flex items-center gap-2 break-all"
                  >
                    📧 karin.art.tattoo1@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 