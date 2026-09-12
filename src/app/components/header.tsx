"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaInstagram, FaFacebook } from "react-icons/fa";

type HeaderBrand = "tattoo" | "beauty";

interface HeaderProps {
  brand?: HeaderBrand;
  basePath?: string;
}

interface NavigationLink {
  name: string;
  path: string;
}

interface HighlightMenuLink {
  name: string;
  path: string;
  description: string;
  isActive: (pathname: string) => boolean;
}

const BOOKMARK_WIDTH = "3.5rem";

const getSwitchTarget = (brand: HeaderBrand) =>
  brand === "beauty" ? "/tattoo" : "/beauty-sphere";

const normalizeBasePath = (path: string) => {
  if (!path || path === "/") return "";
  return path.endsWith("/") ? path.slice(0, -1) : path;
};

function NavLink({
  href,
  children,
  active,
  onClick,
  large = true,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block transition-colors duration-200 no-underline ${
        large ? "text-xl sm:text-2xl font-medium tracking-tight" : "text-base font-medium"
      } ${active ? "text-[#c2a4df]" : "text-white/90 hover:text-[#c2a4df]"}`}
    >
      {children}
    </Link>
  );
}

function ExternalArrow() {
  return <span className="inline-block ml-1 text-lg opacity-70">↗</span>;
}

function HighlightNavLink({
  href,
  title,
  description,
  active,
  onClick,
}: {
  href: string;
  title: string;
  description: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block rounded-xl border px-4 py-3.5 transition-all duration-200 no-underline ${
        active
          ? "border-[#c2a4df]/70 bg-[#c2a4df]/20 shadow-[0_0_24px_rgba(194,164,223,0.15)]"
          : "border-[#c2a4df]/35 bg-[#c2a4df]/10 hover:border-[#c2a4df]/55 hover:bg-[#c2a4df]/15"
      }`}
    >
      <span className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-[#c2a4df]">
        <span className="text-[#c2a4df]/80 text-sm">✦</span>
        {title}
      </span>
      <span className="block text-white/55 text-sm mt-1 leading-snug">{description}</span>
    </Link>
  );
}

export default function Header({ brand, basePath }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [backdropActive, setBackdropActive] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [isGalleryFullscreen, setIsGalleryFullscreen] = useState(false);
  const menuScrollRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuOpenRef = useRef(false);
  const backdropActiveRef = useRef(false);
  const pathname = usePathname();
  const [inkProgramEnabled, setInkProgramEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/ink-program/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.enabled === "boolean") {
          setInkProgramEnabled(data.enabled);
        }
      })
      .catch(() => {});
  }, []);

  const resolvedBrand: HeaderBrand =
    brand ?? (pathname.startsWith("/beauty-sphere") ? "beauty" : "tattoo");
  const resolvedBasePath =
    basePath ??
    (resolvedBrand === "beauty"
      ? "/beauty-sphere"
      : pathname.startsWith("/tattoo")
        ? "/tattoo"
        : "");
  const normalizedBasePath = normalizeBasePath(resolvedBasePath);
  const isTattooSection = resolvedBrand === "tattoo";

  const sectionLabel = isTattooSection ? "Karin Art Tattoo" : "Karin Beauty Sphere";
  const logoLabel = isTattooSection ? "Karin Art" : "Karin Beauty Sphere";

  const homePath = normalizedBasePath || "/";
  const navigationLinks: NavigationLink[] = isTattooSection
    ? [
        { name: "Domov", path: homePath },
        { name: "O mne", path: `${normalizedBasePath}/about` || "/about" },
        { name: "Portfólio", path: `${normalizedBasePath}/portfolio` || "/portfolio" },
        { name: "Voľné návrhy", path: "/volne-navrhy" },
        { name: "Služby", path: `${normalizedBasePath}/services` || "/services" },
        { name: "Kontakt", path: `${normalizedBasePath}/contact` || "/contact" },
      ]
    : [
        { name: "Domov", path: homePath },
        { name: "Galéria", path: `${normalizedBasePath}/portfolio` },
        { name: "Ošetrenia pleti", path: `${normalizedBasePath}/osetrenia-pleti` },
        { name: "Laminácia", path: `${normalizedBasePath}/laminacia` },
        { name: "Permanentný make-up", path: `${normalizedBasePath}/permanentny-make-up` },
        { name: "Kontakt", path: `${normalizedBasePath}/contact` },
      ];

  const programHighlightLinks: HighlightMenuLink[] = isTattooSection
    ? [
        ...(inkProgramEnabled
          ? [
              {
                name: "Ink program",
                path: "/program/ink-kredity",
                description: "Zbieraj ink kredity a zľavy za pozvaných",
                isActive: (path: string) => path.startsWith("/program"),
              },
            ]
          : []),
        {
          name: "Zákaznícka zóna",
          path: "/customer/login",
          description: "Prihlásenie, QR kód a tvoj profil",
          isActive: (path) =>
            path.startsWith("/customer") ||
            path === "/customer-program" ||
            path === "/register",
        },
      ]
    : [];

  const switchPath = getSwitchTarget(resolvedBrand);
  const switchLabel =
    resolvedBrand === "beauty" ? "Karin Art Tattoo" : "Karin Beauty Sphere";

  const isActiveLink = (path: string) => pathname === path;

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    backdropActiveRef.current = backdropActive;
  }, [backdropActive]);

  useEffect(() => {
    setMounted(true);

    // Detect mobile layout
    const mq = window.matchMedia("(min-width: 640px)");
    setIsMobileLayout(!mq.matches);
    const mqHandler = (e: MediaQueryListEvent) => setIsMobileLayout(!e.matches);
    mq.addEventListener("change", mqHandler);

    // Listen for gallery fullscreen events
    const fullscreenHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { open: boolean };
      setIsGalleryFullscreen(detail.open);
      if (detail.open) {
        // Close menu if open when gallery opens
        setMenuOpen(false);
        setBackdropActive(false);
      }
    };
    window.addEventListener("gallery:fullscreen", fullscreenHandler);

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      mq.removeEventListener("change", mqHandler);
      window.removeEventListener("gallery:fullscreen", fullscreenHandler);
    };
  }, []);

  const resetMenuScroll = () => {
    if (menuScrollRef.current) {
      menuScrollRef.current.scrollTop = 0;
    }
  };

  const openMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    resetMenuScroll();
    const reopening = backdropOpen;
    setBackdropOpen(true);
    setMenuOpen(true);
    if (reopening) {
      setBackdropActive(true);
    } else {
      requestAnimationFrame(() => {
        setBackdropActive(true);
      });
    }
  };

  const closeMenu = () => {
    resetMenuScroll();
    setBackdropActive(false);
    setMenuOpen(false);
  };

  const handleBackdropTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>
  ) => {
    if (event.propertyName !== "background-color") return;
    if (!menuOpenRef.current && !backdropActiveRef.current) {
      setBackdropOpen(false);
    }
  };

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(closeMenu, 120);
  };

  if (!mounted) return null;

  // Closed state transform: on mobile no bookmark sticks out; on desktop bookmark peeks
  const closedTransform = isMobileLayout
    ? "translateX(100%)"
    : `translateX(calc(100% - ${BOOKMARK_WIDTH}))`;

  return createPortal(
    <>
      {/* Fixed logo — always pinned to viewport top-left when menu closed */}
      <div
        className={`site-logo-bar ${menuOpen ? "site-logo-bar--hidden" : ""}`}
        aria-hidden={menuOpen}
      >
        <Link href={homePath} className="no-underline">
          <h1
            className={`header-title text-white cursor-pointer ${!isTattooSection ? "header-title--compact" : ""}`}
            title={logoLabel}
          >
            {logoLabel}
          </h1>
        </Link>
      </div>

      {/* Mobile hamburger button — only shown on mobile, hidden when gallery is fullscreen */}
      {!isGalleryFullscreen && (
        <button
          type="button"
          onClick={() => (menuOpen ? closeMenu() : openMenu())}
          aria-label={menuOpen ? "Zavrieť menu" : "Otvoriť menu"}
          aria-expanded={menuOpen}
          className={`menu-hamburger sm:hidden ${menuOpen ? "menu-hamburger--open" : ""}`}
        >
          <span className="menu-hamburger__line" />
          <span className="menu-hamburger__line" />
          <span className="menu-hamburger__line" />
        </button>
      )}

      {backdropOpen && (
        <div
          className={`menu-backdrop fixed inset-0 z-[60] ${
            backdropActive ? "menu-backdrop--active pointer-events-auto" : "pointer-events-none"
          }`}
          aria-hidden={!menuOpen}
        >
          <div
            className="menu-backdrop-screen"
            onClick={closeMenu}
            onTransitionEnd={handleBackdropTransitionEnd}
          />
          {/* Backdrop logo — desktop only */}
          <div
            className={`menu-backdrop-logo hidden sm:flex absolute top-0 bottom-0 left-0 items-center justify-center pointer-events-none w-[calc(100%-min(100%,380px)-3.5rem)] md:w-[calc(66vw-3.5rem)] ${
              backdropActive ? "menu-backdrop-logo--visible" : ""
            }`}
          >
            <Link
              href={homePath}
              className="no-underline pointer-events-auto"
              onClick={closeMenu}
            >
              <h1
                className={`header-title header-title--menu-overlay text-white text-center ${!isTattooSection ? "header-title--compact" : ""}`}
              >
                {logoLabel}
              </h1>
            </Link>
          </div>
        </div>
      )}

      {/* Bookmark + drawer — slides from right */}
      <div
        className={`menu-shell fixed top-0 right-0 z-[70] flex h-full items-center ${
          menuOpen ? "menu-shell--open" : ""
        }`}
        style={{
          transform: menuOpen ? "translateX(0)" : closedTransform,
        }}
        onMouseEnter={!isMobileLayout ? openMenu : undefined}
        onMouseLeave={!isMobileLayout ? scheduleClose : undefined}
      >
        {/* Desktop-only bookmark tab — hidden on mobile, also hidden in fullscreen */}
        {!isGalleryFullscreen && (
          <button
            type="button"
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
            aria-label={menuOpen ? "Zavrieť menu" : "Otvoriť menu"}
            aria-expanded={menuOpen}
            className={`menu-bookmark hidden sm:flex ${menuOpen ? "menu-bookmark--open" : ""}`}
          >
            Menu
          </button>
        )}

        <aside
          className="menu-drawer flex h-full w-full flex-col sm:w-[min(100%,380px)] md:w-[34vw] md:min-w-[300px] md:max-w-[420px]"
          aria-label="Navigácia"
          aria-hidden={!menuOpen}
          inert={!menuOpen ? true : undefined}
        >
          <div
            ref={menuScrollRef}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 sm:px-7 pt-14 sm:pt-12 pb-8"
          >
            {/* Section label — shown at top of drawer */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#c2a4df]/60 mb-1">
                {sectionLabel}
              </p>
              <div className="w-8 h-px bg-[#c2a4df]/20" />
            </div>

            {programHighlightLinks.length > 0 && (
              <section className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#c2a4df]/80 mb-3">
                  Letná akcia
                </p>
                <div className="space-y-3">
                  {programHighlightLinks.map((link) => (
                    <HighlightNavLink
                      key={link.path}
                      href={link.path}
                      title={link.name}
                      description={link.description}
                      active={link.isActive(pathname)}
                      onClick={closeMenu}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-4">Menu</p>
              <nav className="space-y-3">
                {navigationLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    href={link.path}
                    active={isActiveLink(link.path)}
                    onClick={closeMenu}
                  >
                    {link.name}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-8">
                <Link
                  href="/appointment"
                  onClick={closeMenu}
                  className="inline-flex items-center text-xl sm:text-2xl font-medium text-white hover:text-[#c2a4df] transition-colors no-underline"
                >
                  Rezervovať termín
                  <ExternalArrow />
                </Link>
              </div>
            </section>

            <div className="border-t border-white/10 mb-10" />

            <section className="mb-10 space-y-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-5">
                {isTattooSection ? "Ďalšie" : "Program"}
              </p>
              {!isTattooSection && (
                <NavLink
                  href="/customer/login"
                  active={
                    pathname.startsWith("/customer") || pathname === "/customer-program"
                  }
                  onClick={closeMenu}
                  large={false}
                >
                  Zákaznícka zóna
                </NavLink>
              )}
              <NavLink href={switchPath} onClick={closeMenu} large={false}>
                {switchLabel}
              </NavLink>
            </section>

            <div className="border-t border-white/10 mb-10" />

            <section className="mb-10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-5">Kontakt</p>
              <a
                href="mailto:info@karinart.sk"
                className="block text-xl sm:text-2xl font-medium text-white hover:text-[#c2a4df] transition-colors no-underline mb-3"
              >
                info@karinart.sk
                <ExternalArrow />
              </a>
              <a
                href="tel:+421902482967"
                className="block text-sm text-white/60 hover:text-[#c2a4df] transition-colors no-underline mb-2"
              >
                +421 902 482 967
              </a>
              <a
                href="https://www.google.com/maps/search/Ondavsk%C3%A1+1+Bratislava?hl=sk"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-white/60 hover:text-[#c2a4df] transition-colors no-underline"
              >
                Ondavská 1, Bratislava
                <ExternalArrow />
              </a>
            </section>

            <div className="border-t border-white/10 mb-10" />

            <section>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-5">Sociálne siete</p>
              <div className="flex gap-5">
                <a
                  href="https://www.instagram.com/karin_art_tattoo?igsh=N3lqejRsenR5MWd0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-[#c2a4df] transition-colors text-xl"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61560932097231"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-[#c2a4df] transition-colors text-xl"
                  aria-label="Facebook"
                >
                  <FaFacebook />
                </a>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </>,
    document.body
  );
}
