"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Metadata } from "next";
import { usePathname } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: string;
}


export default function Portfolio() {
  const pathname = usePathname();
  const portfolioRoute = pathname.startsWith("/tattoo") ? "/tattoo/portfolio" : "/portfolio";
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());

  // Handle URL parameters for direct image opening
  useEffect(() => {
    const checkUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const selectedId = params.get('selected');
      const imageUrl = params.get('image');
      const title = params.get('title');

      // Handle direct image opening
      if (selectedId && imageUrl) {
        const imageFromUrl: GalleryItem = {
          id: selectedId,
          imageUrl: decodeURIComponent(imageUrl),
          title: title ? decodeURIComponent(title) : '',
          createdAt: new Date().toISOString()
        };
        setSelectedImage(imageFromUrl);
        setIsFullscreen(true);

        // Clean up URL parameters after handling them
        window.history.replaceState({}, "", portfolioRoute);
      }
    };

    // Check on initial load
    checkUrlParams();

    // Listen for navigation events
    const handleNavigation = () => {
      // Small delay to ensure URL has updated
      setTimeout(checkUrlParams, 50);
    };

    // Listen for popstate (back/forward button)
    window.addEventListener('popstate', handleNavigation);
    
    // Listen for hashchange (in case of hash navigation)
    window.addEventListener('hashchange', handleNavigation);

    // Check more frequently for URL changes
    const interval = setInterval(checkUrlParams, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, [portfolioRoute]);

  const observer = useMemo(
    () =>
      typeof window !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  setVisibleImages((prev) => new Set([...prev, entry.target.id]));
                }
              });
            },
            { threshold: 0.1 }
          )
        : null,
    []
  );

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [isFullscreen]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isFullscreen) return;
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale + delta), 3);
    setScale(newScale);
  }, [isFullscreen, scale]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const closeFullscreen = useCallback(() => {
    setSelectedImage(null);
    setIsFullscreen(false);
    window.dispatchEvent(new CustomEvent('gallery:fullscreen', { detail: { open: false } }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeFullscreen]);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const portfolioResponse = await fetch("/api/portfolio", {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          if (!portfolioResponse.ok) throw new Error(`Portfolio HTTP error! ${portfolioResponse.status}`);

          const portfolioData = await portfolioResponse.json();

          if (!Array.isArray(portfolioData)) throw new Error("Invalid portfolio response format");

          setImages(portfolioData);
          setError(null);
        } catch (err) {
          console.error("Error fetching portfolio data:", err);
          setError(err instanceof Error ? err.message : 'Unknown error');
          setImages([]);
        } finally {
          setIsLoading(false);
        }
      };

    fetchData();

    return () => {
      if (observer) observer.disconnect();
    };
  }, [observer]);

  useEffect(() => {
    if (!observer) return;
    const elements = document.querySelectorAll(".gallery-image");
    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [images, observer]);

  const openModal = useCallback((image: GalleryItem) => {
    setSelectedImage(image);
    setIsFullscreen(true);
    window.dispatchEvent(new CustomEvent('gallery:fullscreen', { detail: { open: true } }));
  }, []);

  return (
    <div>
      <section className="relative page-hero h-[70vh]">
        <div
          className="absolute inset-0 bg-no-repeat z-0"
          style={{
            backgroundImage: "url(/images/img_7929.webp)",
            backgroundSize: "cover",
            backgroundPosition: "85% center"
          }}
        ></div>
        <div className="page-hero__overlay"></div>
        <div className="page-hero__content">
          <p className="page-hero__label">Karin Art Tattoo</p>
          <h1 className="page-hero__title text-4xl md:text-6xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg">
            Portfólio
          </h1>
          <p className="page-hero__subtitle text-lg md:text-2xl italic text-gray-300">
            Pozrite si moje najnovšie práce
          </p>
        </div>
      </section>

      <div className="py-16 px-4 md:px-8 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          {/* Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">Načítavam obrázky...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-400">{error}</p>
              </div>
            ) : (
              images.map((item) => (
                <div
                  key={`portfolio-${item.id}`}
                  className="portfolio-tile relative cursor-pointer aspect-square gallery-image"
                  id={item.id}
                  onClick={() => openModal(item)}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={item.imageUrl}
                      alt={item.title || `Profesionálne tetovanie Bratislava - ${item.id} | Karin Art Tattoo Studio`}
                      fill
                      className={`object-cover rounded-md hover:opacity-90 transition-opacity ${
                        visibleImages.has(item.id) ? 'opacity-100' : 'opacity-0'
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        console.error(`Failed to load image: ${item.imageUrl}`);
                      }}
                      onLoad={() => {
                        setVisibleImages((prev) => new Set([...prev, item.id]));
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Empty state messages */}
          {!isLoading && !error && images.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Žiadne obrázky v galérii mojej práce.</p>
            </div>
          )}
        </div>
      </div>

      {isFullscreen && selectedImage && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-90"
          onClick={closeFullscreen}
          onWheel={handleWheel}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div
            className="fixed inset-0 flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleDragStart}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
              }}
            >
              <div className="relative w-[90vw] h-[80vh]">
                {selectedImage && (
                  <Image
                    src={selectedImage.imageUrl}
                    alt={selectedImage.title || `Profesionálne tetovanie Bratislava - Detail | Karin Art Tattoo Studio`}
                    fill
                    className="object-contain"
                    style={{ pointerEvents: 'none' }}
                    priority
                  />
                )}
              </div>
            </div>
          </div>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
            aria-label="Zavrieť"
            className="z-40"
            sx={{
              position: "fixed",
              top: "1rem",
              right: "1rem",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.85)",
              },
            }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>

          <div className="hidden sm:block fixed bottom-4 left-4 right-4 text-white text-sm opacity-50">
            Použite koliesko myši na priblíženie • Kliknite a potiahnite pre posun • ESC pre zatvorenie
          </div>
        </div>
      )}
    </div>
  );
}