import Image from "next/image";
import Link from "next/link";
import { beautyCategories } from "@/app/lib/beautyServices";
import { getCategoryCoverImage } from "@/app/lib/beautyImages";

export default function BeautyServices() {
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
              Služby
            </h1>
            <p className="page-hero__subtitle text-lg md:text-2xl italic text-gray-300">
              Vyberte si oblasť, ktorá vás zaujíma
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 md:px-8 py-16 bg-black text-white">
          <div className="grid gap-5 md:gap-6">
            {beautyCategories.map((category) => {
              const cover = getCategoryCoverImage(category.slug);
              return (
                <Link
                  key={category.slug}
                  href={`/beauty-sphere/${category.slug}`}
                  className="surface-card block overflow-hidden no-underline transition-colors hover:border-[#c2a4df]/40 group"
                >
                  <div className="flex flex-col sm:flex-row">
                    {cover && (
                      <div className="relative w-full sm:w-44 md:w-52 aspect-[4/3] sm:aspect-auto sm:min-h-[140px] shrink-0">
                        <Image
                          src={cover}
                          alt={category.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 208px"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4 p-6 md:p-8 flex-1">
                      <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-white group-hover:text-[#c2a4df] transition-colors">
                          {category.title}
                        </h2>
                        <p className="mt-2 text-white/70 text-sm md:text-base leading-relaxed">
                          {category.intro}
                        </p>
                        <p className="mt-3 text-[#c2a4df]/80 text-xs uppercase tracking-wider">
                          {category.services.length}{" "}
                          {category.services.length === 1
                            ? "ošetrenie"
                            : category.services.length < 5
                              ? "ošetrenia"
                              : "ošetrení"}
                        </p>
                      </div>
                      <span className="text-[#c2a4df] text-2xl shrink-0 mt-1">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="pt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/beauty-sphere/portfolio" className="btn btn-secondary btn-md">
              Prezrieť galériu
            </Link>
            <Link href="/beauty-sphere/appointment" className="btn btn-primary btn-md">
              Rezervovať termín online →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
