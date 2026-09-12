// src/app/[404]/page.tsx

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Custom404() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"} bg-no-repeat`}
        style={{
          backgroundImage: "url(/images/img_7648.webp)",
          backgroundSize: "cover",
          backgroundPosition: "75% center"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
      </div>
      <div className="relative z-10 text-center p-6 md:p-8 bg-black/60 rounded-lg max-w-lg mx-4">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Stránka nebola nájdená</h2>
        <p className="mb-6 text-lg">
          Ospravedlňujeme sa, ale stránka, ktorú hľadáte, neexistuje. Možno by vás zaujímalo niečo iné z našej stránky.
        </p>
        <Link href="/" className="inline-block px-6 py-3 bg-[#7568ad] hover:bg-[#5e528c] text-white font-semibold rounded transition-colors duration-300">
          Späť na Domov
        </Link>
      </div>
    </div>
  );
}