"use client";

import { Metadata } from "next";
import Link from "next/link";

export default function BusinessContact() {
  return (
    <div>
      {/* Full-Page Hero Banner */}
      <section className="relative page-hero min-h-[70vh] flex flex-col text-white px-4">
        <div
          className="absolute inset-0 bg-no-repeat z-0 hero-banner-bg"
          style={{
            backgroundImage: "url(/images/studio.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
        <div className="page-hero__overlay"></div>

        <div className="relative z-10 flex flex-col justify-center flex-1 text-center py-20">
          <div className="page-hero__content !h-auto !py-0 !max-w-none">
            <p className="page-hero__label">Karin Art</p>
            <h1 className="page-hero__title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg">
              Kontaktujte ma
            </h1>
            <p className="page-hero__subtitle text-sm md:text-base lg:text-lg text-gray-200 font-light italic px-6 max-w-xl mx-auto">
              Pre viac informácií alebo na rezerváciu služby, kontaktujte ma nižšie.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-2xl mx-auto mt-10 w-full px-2">
            {[
              { label: "Adresa", value: "Ondavská 1, Bratislava" },
              { label: "Tel", value: "+421 902 482 967", href: "tel:+421902482967" },
              { label: "Email", value: "info@karinart.sk", href: "mailto:info@karinart.sk" },
              {
                label: "Instagram",
                value: "@karin_art_tattoo",
                href: "https://www.instagram.com/karin_art_tattoo?igsh=N3lqejRsenR5MWd0",
                external: true,
              },
            ].map((item) => (
              <div key={item.label} className="surface-card p-4 md:p-5 text-center">
                <h2 className="text-xs uppercase tracking-wider text-[#c2a4df]/70 mb-2">{item.label}</h2>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="text-sm md:text-base text-white/90 hover:text-[#c2a4df] transition-colors break-all"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm md:text-base text-white/90">{item.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/appointment" className="btn btn-primary btn-lg">
              Rezervovať termín
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 md:py-16 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-[#c2a4df]">Nájdite ma</h2>
          <div className="relative w-full h-[300px] sm:h-[360px] md:h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <iframe
              src="https://www.google.com/maps?q=Ondavsk%C3%A1+1,+Bratislava&output=embed&hl=sk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
