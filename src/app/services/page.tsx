// src/app/services/page.tsx
"use client";

import { useState } from "react";
import { Metadata } from "next";
import Link from "next/link";

const questions = [
  {
    question: "Rozsah služieb",
    answer:
      "Ponúkam vlastné dizajny, prekrytie tetovaní (v závislosti od rozsahu predchádzajúceho tetovania), poradenstvo ohľadom starostlivosti a opravu tetovaní.",
  },
  {
    question: "Konzultácie",
    answer:
      "Ponúkam konzultácie, ktoré je možné dohodnúť pred samotným termínom, hlavne pri väčších tetovaniach. Taktiež mám v ponuke aj online konzultácie.",
  },
  {
    question: "Veľkosť a umiestnenie tetovaní",
    answer:
      "Preferujem menšie tetovania, napríklad celé rukávy robím len ako skupiny menších tetovaní. Všetko je možné prebrať na konzultácii.",
  },
  {
    question: "Objednávanie a dostupnosť",
    answer:
      "Objednať sa dá cez všetky sociálne siete, telefonicky aj e-mailom, zvyčajne s dostupnosťou do dvoch dní. Pre rýchlejšie a pohodlnejšie objednávanie môžete využiť náš online rezervačný systém.",
  },
  {
    question: "Poradenstvo ohľadom starostlivosti",
    answer:
      "Poskytujem úpravu tetovania do dvoch mesiacov zadarmo, ak je to moje dielo. Rovnako ponúkam odporúčania na krémy na starostlivosť po tetovaní a zasielam dokumenty ohľadom starostlivosti pred aj po tetovaní.",
  },
  {
    question: "Atmosféra v štúdiu a odporúčania",
    answer:
      "Snažím sa vytvoriť útulnú atmosféru – štúdio je zariadené podľa môjho vkusu s doplnkami, ktoré vytvárajú pohodlie, aby sa klienti cítili ako doma. Ponúkam kávu a čaj, aby sa z návštevy stal príjemný zážitok ako so známymi. Čo sa týka odporúčaní, v dokumentoch, ktoré zasielam, sú všetky potrebné pokyny, no zdôraznila by som, aby klienti pred tetovaním nekonzumovali alkohol, a odporúčam dôsledné krémovanie tetovania počas hojenia.",
  },
];

export default function Services() {
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  const toggleQuestion = (index: number) => {
    setOpenQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  return (
    <div className="bg-black text-white">      <main className="relative">
        <section className="relative page-hero h-[70vh]">
          <div
            className="absolute inset-0 bg-no-repeat z-0"
            style={{
              backgroundImage: "url(/images/img_7778.webp)",
              backgroundSize: "cover",
              backgroundPosition: "right center"
            }}
          ></div>
          <div className="page-hero__overlay"></div>
          <div className="page-hero__content">
            <p className="page-hero__label">Karin Art Tattoo</p>
            <h1 className="page-hero__title text-4xl md:text-6xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg">
              Služby
            </h1>
            <p className="page-hero__subtitle text-lg md:text-2xl italic text-gray-300">
              Pozrite sa, aké služby ponúkam a čo môžete očakávať
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 space-y-4 bg-black text-white">
          {questions.map((item, index) => (
            <div key={index} className="accordion-item">
              <h2
                className="text-xl md:text-2xl font-semibold cursor-pointer flex justify-between items-center text-white gap-4"
                onClick={() => toggleQuestion(index)}
              >
                {item.question}
                <span className="text-[#c2a4df] text-lg shrink-0 w-8 h-8 rounded-full border border-[#c2a4df]/30 flex items-center justify-center">
                  {openQuestions.includes(index) ? "−" : "+"}
                </span>
              </h2>
              <div
                className={`mt-3 ${
                  openQuestions.includes(index) ? "block" : "hidden"
                } overflow-auto break-words`}
              >
                <div className="italic border-l-2 pl-4 border-[#c2a4df]/60 text-white/85 leading-relaxed">
                  <p>{item.answer}</p>
                  {item.question === "Objednávanie a dostupnosť" && (
                    <div className="mt-4 not-italic">
                      <Link href="/appointment" className="btn btn-primary btn-sm">
                        Rezervovať termín online →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}