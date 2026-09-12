"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BeautyCategory } from "@/app/lib/beautyServices";
import { formatBeautyDuration, formatBeautyPrice } from "@/app/lib/beautyServicesCatalog";

interface BeautyCategoryPageProps {
  category: BeautyCategory;
}

function ServiceImages({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <div
      className={`not-italic mt-4 grid gap-2 ${
        images.length === 1
          ? "grid-cols-1 max-w-sm"
          : images.length === 2
            ? "grid-cols-2"
            : "grid-cols-2 sm:grid-cols-3"
      }`}
    >
      {images.map((src) => (
        <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10">
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 200px"
          />
        </div>
      ))}
    </div>
  );
}

export default function BeautyCategoryPage({ category }: BeautyCategoryPageProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="bg-black text-white">
      <main className="relative">
        <section className="relative page-hero h-[70vh]">
          <div
            className="absolute inset-0 bg-no-repeat z-0"
            style={{
              backgroundImage: "url(/images/karin.webp)",
              backgroundSize: "cover",
              backgroundPosition: "right center",
            }}
          ></div>
          <div className="page-hero__overlay"></div>
          <div className="page-hero__content">
            <p className="page-hero__label">Karin Beauty Sphere</p>
            <h1 className="page-hero__title text-4xl md:text-6xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg">
              {category.title}
            </h1>
            <p className="page-hero__subtitle text-lg md:text-2xl italic text-gray-300">
              {category.subtitle}
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16 bg-black text-white">
          <p className="text-white/80 text-base md:text-lg leading-relaxed mb-10 italic border-l-2 border-[#c2a4df]/40 pl-4">
            {category.intro}
          </p>

          <div className="space-y-4">
            {category.services.map((item, index) => (
              <div key={item.title} className="accordion-item">
                <h2
                  className="text-xl md:text-2xl font-semibold cursor-pointer flex justify-between items-center text-white gap-4"
                  onClick={() => toggleItem(index)}
                >
                  <span className="min-w-0">
                    {item.title}
                    {item.bookable && item.durationHours != null && (
                      <span className="block text-sm font-normal text-[#c2a4df]/90 mt-1 not-italic">
                        {formatBeautyPrice(item.priceEUR ?? null)} ·{' '}
                        {formatBeautyDuration(item.durationHours)}
                      </span>
                    )}
                  </span>
                  <span className="text-[#c2a4df] text-lg shrink-0 w-8 h-8 rounded-full border border-[#c2a4df]/30 flex items-center justify-center">
                    {openItems.includes(index) ? "−" : "+"}
                  </span>
                </h2>
                <div
                  className={`mt-3 ${
                    openItems.includes(index) ? "block" : "hidden"
                  } overflow-auto break-words`}
                >
                  <div className="italic border-l-2 pl-4 border-[#c2a4df]/60 text-white/85 leading-relaxed space-y-3">
                    <p>{item.description}</p>
                    {item.note && (
                      <p className="not-italic text-[#c2a4df]/90 text-sm">{item.note}</p>
                    )}
                    {item.images && <ServiceImages images={item.images} />}
                    {item.bookable && item.id && (
                      <Link
                        href={`/beauty-sphere/appointment?service=${item.id}`}
                        className="not-italic inline-flex mt-4 text-sm font-semibold text-[#c2a4df] hover:text-white"
                      >
                        Rezervovať túto službu →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/beauty-sphere/services" className="btn btn-secondary btn-md">
              ← Všetky služby
            </Link>
            <Link href="/beauty-sphere/portfolio" className="btn btn-secondary btn-md">
              Galéria
            </Link>
            <Link href="/beauty-sphere/appointment" className="btn btn-primary btn-md">
              Rezervovať termín →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
