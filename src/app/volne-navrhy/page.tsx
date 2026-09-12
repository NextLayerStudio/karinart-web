"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";

interface FlashDesignItem {
  id: string;
  imageUrl: string;
  title: string;
  price: number;
  reserved: boolean;
  createdAt: string;
}

export default function Flashe() {
  const router = useRouter();
  const [flashDesigns, setFlashDesigns] = useState<FlashDesignItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<FlashDesignItem | null>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());

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
    setSelectedDesign(null);
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
        const response = await fetch("/api/flash-designs", {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data = await response.json();

        if (!Array.isArray(data)) throw new Error("Invalid response format");

        setFlashDesigns(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching flash designs:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setFlashDesigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
    if (!observer) return;
    const elements = document.querySelectorAll(".gallery-image");
    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [flashDesigns, observer]);

  const openModal = useCallback((design: FlashDesignItem) => {
    setSelectedDesign(design);
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
          <p className="page-hero__label">Flash dizajny</p>
          <h1 className="page-hero__title text-4xl md:text-6xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg">
            Voľné Návrhy
          </h1>
          <p className="page-hero__subtitle text-lg md:text-2xl italic text-gray-300">
            Vyberte si z mojich dostupných voľných návrhov
          </p>
        </div>
      </section>

      <div className="py-16 px-4 md:px-8 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          {/* Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">Načítavam dizajny...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-400">{error}</p>
              </div>
            ) : flashDesigns.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">Žiadne flash dizajny nie sú momentálne k dispozícii.</p>
              </div>
            ) : (
              flashDesigns.map((design) => (
                <div
                  key={design.id}
                  className="relative cursor-pointer aspect-square overflow-hidden gallery-image rounded-md group"
                  id={design.id}
                  onClick={() => openModal(design)}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={design.imageUrl}
                      alt={design.title || `Flash dizajn - ${design.id} | Karin Art Tattoo Studio`}
                      fill
                      className={`object-cover rounded-md hover:opacity-90 transition-opacity ${
                        visibleImages.has(design.id) ? 'opacity-100' : 'opacity-0'
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        console.error(`Failed to load image: ${design.imageUrl}`);
                      }}
                      onLoad={() => {
                        setVisibleImages((prev) => new Set([...prev, design.id]));
                      }}
                    />
                    {design.reserved && (
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 overflow-hidden">
                        <div 
                          className="absolute bg-red-600/70 text-white font-bold shadow-2xl"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotate(45deg)',
                            width: '150%',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          Rezervované
                        </div>
                      </div>
                    )}
                    {/* Price Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 sm:p-3 rounded-b-md">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="text-[#c2a4df] font-bold text-base sm:text-lg shrink-0">
                          €{design.price.toFixed(2)}
                        </span>
                        <span className="text-white/80 text-xs hidden sm:inline">
                          Kliknite pre detail
                        </span>
                      </div>
                    </div>
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                      <div className="text-center px-3 max-w-full">
                        <p className="text-white font-semibold mb-2 truncate">{design.title}</p>
                        <p className="text-[#c2a4df] text-2xl font-bold">€{design.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isFullscreen && selectedDesign && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-95"
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
              <div className="relative w-[90vw] h-[78vh]">
                {selectedDesign && (
                  <Image
                    src={selectedDesign.imageUrl}
                    alt={selectedDesign.title || `Flash dizajn - Detail | Karin Art Tattoo Studio`}
                    fill
                    className="object-contain"
                    style={{ pointerEvents: 'none' }}
                    priority
                  />
                )}
                {selectedDesign.reserved && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/50 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md text-sm sm:text-lg font-bold z-10 shadow-lg whitespace-nowrap">
                    Rezervované
                  </div>
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

          <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-5 py-2.5 rounded-xl text-center max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-semibold text-base sm:text-lg mb-0.5 truncate">{selectedDesign.title}</p>
            <p className="text-[#c2a4df] text-xl sm:text-2xl font-bold">€{selectedDesign.price.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
