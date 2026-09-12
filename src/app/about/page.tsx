"use client";

import { useState } from "react";
import { Metadata } from "next";

export default function About() {
  const [activeSections, setActiveSections] = useState<number[]>([]);
  const [typedSections, setTypedSections] = useState<number[]>([]);
  const [currentTexts, setCurrentTexts] = useState<string[]>(["", "", "", "", "", ""]); // Store typed text for each section

  const toggleSection = (index: number) => {
    if (activeSections.includes(index)) {
      // Collapse section
      setActiveSections(activeSections.filter((i) => i !== index));
    } else {
      // Expand section
      setActiveSections([...activeSections, index]);

      if (!typedSections.includes(index)) {
        // Mark section as typed if not already done
        setTypedSections([...typedSections, index]);
        startTypingAnimation(index); // Call the specific function for the section
      }
    }
  };

  const isActive = (index: number) => activeSections.includes(index);
  const isTyped = (index: number) => typedSections.includes(index);

  const sections = [
    {
      title: "Pozadie a inšpirácia",
      content:
        "Nebol to priamo zlomový bod, ale už dlho som kreslila a viacerí ľudia sa ma pýtali, či nechcem začať tetovať, pretože moje kresby vyzerali dobre. Najprv som však chcela ísť na vysokú školu na psychológiu, no nakoniec som si uvedomila, že štúdium nie je pre mňa, a rozhodla som sa skúsiť tetovanie. Kúpila som si strojček a začala trénovať.",
      speed: 30,
    },
    {
      title: "Umelecký štýl",
      content:
        "Mám rada japonský štýl tetovania, najmä japonské vzory ako koi kapre, sakury a celkovo tieňovanie. Nemám však vyslovene presný štýl – každé tetovanie je unikátne a prispôsobené klientovi.",
      speed: 30,
    },
    {
      title: "Skúsenosti a motivácia",
      content:
        "Tetovaniu sa venujem od roku 2022. Nie som v odbore vyškolená, chodila som na gymnázium a neskôr som sa učila sama. Absolvovala som online kurzy a neskôr aj prezenčné kurzy na permanentný makeup. Najviac ma baví tieňovanie, ktoré je pre mňa výzvou. Najviac ma motivuje, keď vidím nadšenie klienta z tetovania a uvedomujem si, že si vážia hodnotu tejto práce.",
      speed: 30,
    },
    {
      title: "Filozofia a prístup",
      content:
        "Pre mňa je tetovanie forma umenia s jedinečnou hodnotou – nie je to papier ani plátno, a keď sa už vytetuje, nedá sa to jednoducho zmyť. Je to životné dielo, ktoré má osobnú aj profesionálnu hodnotu.",
      speed: 30,
    },
    {
      title: "Inšpirácie a obľúbení umelci",
      content:
        "Zana.ink je pre mňa veľkou inšpiráciou, pretože ešte predtým, než som začala tetovať, som u nej bola na tetovaní a veľmi sa mi zapáčil jej štýl. Ďalej ma inšpiruje Samuel Potúček, ktorý z tetovania spravil niečo viac než len zábavu a kreslenie.",
      speed: 30,
    },
    {
      title: "Budúce ciele",
      content:
        "V budúcnosti by som chcela viacej tetovať realizmus a otvoriť si väčší salón, kde by som mohla zaučať a spolupracovať s novými talentmi.",
      speed: 30,
    },
  ];

  const startTypingAnimation = (index: number) => {
    switch (index) {
      case 0:
        startTypingForSection(0);
        break;
      case 1:
        startTypingForSection(1);
        break;
      case 2:
        startTypingForSection(2);
        break;
      case 3:
        startTypingForSection(3);
        break;
      case 4:
        startTypingForSection(4);
        break;
      case 5:
        startTypingForSection(5);
        break;
    }
  };

  const startTypingForSection = (index: number) => {
    const content = sections[index].content;
    const speed = sections[index].speed;
    let charIndex = 0;
    const intervalId = setInterval(() => {
      setCurrentTexts((prev) => {
        const newTexts = [...prev];
        newTexts[index] = content.slice(0, charIndex + 1);
        charIndex++;
        return newTexts;
      });
      if (charIndex >= content.length) clearInterval(intervalId);
    }, speed);
  };

  return (
    <div className="bg-black text-white">      <main className="relative">
        <section className="relative page-hero h-[70vh]">
          <div
            className="absolute inset-0 bg-no-repeat z-0 hero-banner-bg"
            style={{
              backgroundImage: "url(/images/img_1919.webp)",
            }}
          ></div>
          <div className="page-hero__overlay"></div>
          <div className="page-hero__content">
            <p className="page-hero__label">Karin Art Tattoo</p>
            <h1 className="page-hero__title text-4xl md:text-6xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg">O Mne</h1>
            <p className="page-hero__subtitle text-lg md:text-2xl italic text-gray-300">
              Moja cesta od kresieb k tetovaniu
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 space-y-4 bg-black text-white">
          {sections.map((section, index) => (
            <div key={index} className="accordion-item">
              <h2
                className="text-xl md:text-2xl font-semibold cursor-pointer flex justify-between items-center text-white gap-4"
                onClick={() => toggleSection(index)}
              >
                {section.title}
                <span className="text-[#c2a4df] text-lg shrink-0 w-8 h-8 rounded-full border border-[#c2a4df]/30 flex items-center justify-center">
                  {isActive(index) ? "−" : "+"}
                </span>
              </h2>
              <div
                className={`mt-3 ${
                  isActive(index) ? "block" : "hidden"
                } overflow-auto break-words`}
              >
                <p
                  className={`italic border-l-2 pl-4 border-[#c2a4df]/60 text-white/85 leading-relaxed ${
                    isTyped(index) ? "typed" : "typing-animation"
                  }`}
                >
                  {currentTexts[index] || ""}
                </p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
