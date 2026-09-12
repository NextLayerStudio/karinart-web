"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: string;
}

export default function BeautyPortfolio() {
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

  useEffect(() => {
    const checkUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const selectedId = params.get("selected");
      const imageUrl = params.get("image");
      const title = params.get("title");

      if (selectedId && imageUrl) {
        const imageFromUrl: GalleryItem = {
          id: selectedId,
          imageUrl: decodeURIComponent(imageUrl),
          title: title ? decodeURIComponent(title) : "",
          createdAt: new Date().toISOString(),
        };
        setSelectedImage(imageFromUrl);
        setIsFullscreen(true);

        window.history.replaceState({}, "", "/beauty-sphere/portfolio");
      }
    };

    checkUrlParams();

    const handleNavigation = () => {
      setTimeout(checkUrlParams, 50);
    };

    window.addEventListener("popstate", handleNavigation);
    window.addEventListener("hashchange", handleNavigation);

    const interval = setInterval(checkUrlParams, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("popstate", handleNavigation);
      window.removeEventListener("hashchange", handleNavigation);
    };
  }, []);

  const observer = useMemo(
    () =>
      typeof window !== "undefined"
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

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!isFullscreen) return;
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.5, scale + delta), 3);
      setScale(newScale);
    },
    [isFullscreen, scale]
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position]
  );

  const handleDragMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const closeFullscreen = useCallback(() => {
    setSelectedImage(null);
    setIsFullscreen(false);
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
        const beautyResponse = await fetch("/api/beauty", {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!beautyResponse.ok) throw new Error(`Beauty HTTP error! ${beautyResponse.status}`);
        const beautyData = await beautyResponse.json();
        if (!Array.isArray(beautyData)) throw new Error("Invalid beauty response format");

        setImages(beautyData);
        setError(null);
      } catch (err) {
        console.error("Error fetching beauty portfolio data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
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
  }, []);

  return (
    <div>
      <section className="relative w-full h-[70vh]">
        <div
          className="absolute inset-0 bg-no-repeat z-0"
          style={{
            backgroundImage: "url(/images/img_7929.webp)",
            backgroundSize: "cover",
            backgroundPosition: "85% center",
          }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-6xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg">Galéria</h1>
          <br></br>
          <p className="text-lg md:text-2xl italic text-gray-300 mt-4">Pozrite si najnovšie práce Karin Beauty Sphere</p>
        </div>
      </section>

      <div className="py-16 px-4 md:px-8 bg-black text-white">
        <div className="max-w-6xl mx-auto">
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
                  key={`beauty-portfolio-${item.id}`}
                  className="relative cursor-pointer aspect-square overflow-hidden gallery-image"
                  id={item.id}
                  onClick={() => openModal(item)}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={item.imageUrl}
                      alt={item.title || `Karin Beauty Sphere - ${item.id}`}
                      fill
                      className={`object-cover rounded-md hover:opacity-90 transition-opacity ${
                        visibleImages.has(item.id) ? "opacity-100" : "opacity-0"
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
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

          {!isLoading && !error && images.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Žiadne obrázky v beauty galérii.</p>
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
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
            >
              <div className="relative w-[90vw] h-[90vh]">
                {selectedImage && (
                  <div className="relative w-full h-full">
                    <div className="relative w-full h-full">
                      <Image
                        src={selectedImage.imageUrl}
                        alt={selectedImage.title || "Detail práce Karin Beauty Sphere"}
                        fill
                        className="object-contain"
                        style={{ pointerEvents: "none" }}
                        priority
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          closeFullscreen();
                        }}
                        className="absolute top-0 right-0 text-white z-40"
                        sx={{
                          color: "white",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.75)",
                          },
                        }}
                      >
                        <CloseIcon fontSize="large" />
                      </IconButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="fixed bottom-4 left-4 text-white text-sm opacity-50">
            Použite koliesko myši na priblíženie • Kliknite a potiahnite pre posun • ESC pre zatvorenie
          </div>
        </div>
      )}
    </div>
  );
}
