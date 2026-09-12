"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: string;
}

interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  timestamp: number;
}

const ACCENT_PRIMARY = "#7568ad";
const ACCENT_SECONDARY = "#c2a4df";

export default function BeautySphereHome() {
  const router = useRouter();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/beauty");
        if (response.ok) {
          const data = await response.json();
          const shuffledItems = [...data].sort(() => Math.random() - 0.5).slice(0, 6);
          setPortfolioItems(shuffledItems);
        } else {
          console.error("Failed to fetch beauty images");
        }
      } catch (error) {
        console.error("Error fetching beauty portfolio items:", error);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews");
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error("Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 1;
        });
      }, 170);

      const reviewInterval = setInterval(() => {
        setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length);
        setProgress(0);
      }, 17000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(reviewInterval);
      };
    }
  }, [reviews.length, currentReviewIndex]);

  const handleImageClick = (item: PortfolioItem) => {
    router.push(
      `/beauty-sphere/portfolio?selected=${encodeURIComponent(item.id)}&image=${encodeURIComponent(item.imageUrl)}&title=${encodeURIComponent(item.title || "")}`
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span key={index} className={`text-xl ${index < rating ? "text-yellow-400" : "text-gray-400"}`}>
        ★
      </span>
    ));
  };

  return (
    <div>
      <section className="relative w-full min-h-[100svh] flex flex-col justify-center items-center text-white px-4 sm:px-6 md:px-8 pt-20 pb-14 sm:py-28">
        <div
          className="absolute inset-0 bg-no-repeat z-0 hero-banner-bg"
          style={{
            backgroundImage: "url(/images/karin.webp)",
          }}
        ></div>

        <div className="absolute inset-0 bg-black opacity-60"></div>

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          <h1 className="hero-display text-white">
            <span>Karin Beauty</span>
            <span>Sphere</span>
          </h1>
          <span className="hero-title-gap" aria-hidden="true" />

          <p className="hero-subtext text-white text-sm sm:text-lg lg:text-xl leading-relaxed font-light italic mb-7 sm:mb-8 max-w-2xl">
            Miesto, kde sa <span style={{ color: ACCENT_SECONDARY }}>jemnosť</span> stretáva s{" "}
            <span style={{ color: ACCENT_SECONDARY }}>precíznosťou</span> — profesionálna starostlivosť o pleť,
            laminácia a permanentný make-up s prirodzeným výsledkom.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center">
            <Link
              href="/beauty-sphere/portfolio"
              className="btn btn-secondary btn-lg w-full sm:w-auto"
            >
              Prezrite si galériu
            </Link>
            <Link
              href="/beauty-sphere/appointment"
              className="btn btn-primary btn-lg w-full sm:w-auto"
            >
              Rezervovať termín
            </Link>
          </div>
        </div>
      </section>

      <section className="quote-band text-center text-white py-12 md:py-16 px-4 md:px-0">
        <div className="max-w-xl mx-auto">
          <p className="text-lg md:text-2xl font-semibold italic leading-relaxed tracking-wide">
            &quot;Krása je detail, ktorý zvýrazní tvoju prirodzenosť.&quot;
          </p>
          <p className="mt-4 text-sm md:text-base text-white/80">— Karin</p>
          <Link href="/beauty-sphere/services" className="btn btn-secondary btn-md mt-8">
            Naše služby
          </Link>
        </div>
      </section>

      <section className="bg-black text-white py-12 md:py-16 px-2 md:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title">Top recenzie od klientov</h2>
          <div className="relative">
            {reviews.length > 0 ? (
              <div className="flex items-center justify-center">
                <div className="hidden md:block w-1/4 opacity-50 transform -translate-x-1/2">
                  <div className="review-card p-4 h-[280px] flex flex-col">
                    <div className="flex items-center mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm truncate">
                          {reviews[(currentReviewIndex - 1 + reviews.length) % reviews.length].authorName}
                        </h3>
                        <div className="flex space-x-1 mt-1">
                          {renderStars(reviews[(currentReviewIndex - 1 + reviews.length) % reviews.length].rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed italic line-clamp-6 flex-1 overflow-hidden">
                      &quot;{reviews[(currentReviewIndex - 1 + reviews.length) % reviews.length].text}&quot;
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-1/2 px-4 md:px-0">
                  <div className="review-card p-6 md:p-8 h-[280px] flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg md:text-xl">{reviews[currentReviewIndex].authorName}</h3>
                        <div className="flex space-x-1 mt-2">{renderStars(reviews[currentReviewIndex].rating)}</div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed italic line-clamp-6 flex-1 overflow-hidden">
                      &quot;{reviews[currentReviewIndex].text}&quot;
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-1/4 opacity-50 transform translate-x-1/2">
                  <div className="review-card p-4 h-[280px] flex flex-col">
                    <div className="flex items-center mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm truncate">
                          {reviews[(currentReviewIndex + 1) % reviews.length].authorName}
                        </h3>
                        <div className="flex space-x-1 mt-1">
                          {renderStars(reviews[(currentReviewIndex + 1) % reviews.length].rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed italic line-clamp-6 flex-1 overflow-hidden">
                      &quot;{reviews[(currentReviewIndex + 1) % reviews.length].text}&quot;
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">Načítavam recenzie...</div>
            )}

            <div className="mt-6 md:mt-8 max-w-[280px] md:max-w-md mx-auto px-4 md:px-0">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-50 ease-linear"
                  style={{ width: `${progress}%`, backgroundColor: ACCENT_PRIMARY }}
                ></div>
              </div>
            </div>

            <div className="flex justify-center mt-4 md:mt-6 space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentReviewIndex(index);
                    setProgress(0);
                  }}
                  className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-colors"
                  style={{ backgroundColor: index === currentReviewIndex ? ACCENT_PRIMARY : "#4b5563" }}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>

            <div className="text-center mt-8 md:mt-12">
              <a
                href={process.env.NEXT_PUBLIC_GOOGLE_PLACE_LINK || "https://www.google.sk/maps/search/Ondavsk%C3%A1+1+Bratislava?hl=sk&entry=ttu"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-md"
              >
                <span>Zobraziť všetky recenzie</span>
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-8 md:py-16 w-full bg-black text-white px-4 md:px-8">
        <h2 className="section-title">Ukážka galérie</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 md:p-4 max-w-6xl mx-auto">
          {portfolioItems.map((item) => (
            <div key={`beauty-portfolio-${item.id}`} className="portfolio-tile relative cursor-pointer aspect-square">
              <div className="relative w-full h-full">
                <Image
                  src={item.imageUrl}
                  alt={item.title || "Ukážka práce z Karin Beauty Sphere"}
                  fill
                  className="object-cover"
                  onClick={() => handleImageClick(item)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
