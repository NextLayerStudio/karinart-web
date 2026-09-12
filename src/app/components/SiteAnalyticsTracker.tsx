'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'karin-analytics-sid';
const QUEUE_KEY = 'karin-analytics-queue';

interface AnalyticsEvent {
  sessionId: string;
  eventType: 'pageview' | 'click' | 'scroll_depth';
  path: string;
  target?: string;
  element?: string;
  label?: string;
  section?: string;
  referrer?: string;
  viewport?: string;
}

function getSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

function getViewport(): string {
  if (typeof window === 'undefined') {
    return 'unknown';
  }
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

function shouldTrack(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }
  return !pathname.startsWith('/admin');
}

function getClickLabel(element: HTMLElement): string {
  const analyticsLabel = element.getAttribute('data-analytics-label');
  if (analyticsLabel) {
    return analyticsLabel.slice(0, 200);
  }

  const text = element.textContent?.replace(/\s+/g, ' ').trim();
  if (text) {
    return text.slice(0, 200);
  }

  const aria = element.getAttribute('aria-label');
  if (aria) {
    return aria.slice(0, 200);
  }

  return '';
}

function getClickTarget(element: HTMLElement): string {
  if (element instanceof HTMLAnchorElement && element.href) {
    try {
      const url = new URL(element.href);
      if (url.origin === window.location.origin) {
        return `${url.pathname}${url.search}${url.hash}`;
      }
      return element.href.slice(0, 500);
    } catch {
      return element.getAttribute('href') ?? '';
    }
  }

  return element.getAttribute('data-analytics-target') ?? '';
}

function getClickSection(element: HTMLElement): string | undefined {
  const section = element.closest('[data-analytics-section]');
  if (section) {
    return section.getAttribute('data-analytics-section') ?? undefined;
  }

  if (element.closest('header, nav')) return 'header';
  if (element.closest('footer')) return 'footer';
  if (element.closest('main')) return 'main';
  return undefined;
}

export default function SiteAnalyticsTracker() {
  const pathname = usePathname();
  const queueRef = useRef<AnalyticsEvent[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollMarksRef = useRef<Set<number>>(new Set());
  const lastPathRef = useRef<string | null>(null);

  const enqueue = (event: AnalyticsEvent) => {
    queueRef.current.push(event);

    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
    }

    flushTimerRef.current = setTimeout(() => {
      const batch = [...queueRef.current];
      queueRef.current = [];

      if (batch.length === 0) {
        return;
      }

      const payload = JSON.stringify({ events: batch });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/collect', blob);
        return;
      }

      fetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        sessionStorage.setItem(QUEUE_KEY, payload);
      });
    }, 1500);
  };

  useEffect(() => {
    if (!shouldTrack(pathname)) {
      return;
    }

    const stored = sessionStorage.getItem(QUEUE_KEY);
    if (stored) {
      sessionStorage.removeItem(QUEUE_KEY);
      fetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stored,
        keepalive: true,
      }).catch(() => undefined);
    }

    const sessionId = getSessionId();

    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      scrollMarksRef.current = new Set();

      enqueue({
        sessionId,
        eventType: 'pageview',
        path: pathname,
        referrer: document.referrer || undefined,
        viewport: getViewport(),
      });
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const clickable = target.closest(
        'a, button, [role="button"], input[type="submit"], input[type="button"]'
      ) as HTMLElement | null;

      if (!clickable || clickable.closest('[data-analytics-ignore]')) {
        return;
      }

      enqueue({
        sessionId,
        eventType: 'click',
        path: pathname,
        target: getClickTarget(clickable),
        element: clickable.tagName.toLowerCase(),
        label: getClickLabel(clickable),
        section: getClickSection(clickable),
        viewport: getViewport(),
      });
    };

    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        return;
      }

      const depth = Math.round((window.scrollY / scrollable) * 100);
      const milestones = [25, 50, 75, 100];

      for (const milestone of milestones) {
        if (depth >= milestone && !scrollMarksRef.current.has(milestone)) {
          scrollMarksRef.current.add(milestone);
          enqueue({
            sessionId,
            eventType: 'scroll_depth',
            path: pathname,
            label: `${milestone}%`,
            viewport: getViewport(),
          });
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && queueRef.current.length > 0) {
        const batch = [...queueRef.current];
        queueRef.current = [];
        const payload = JSON.stringify({ events: batch });
        navigator.sendBeacon?.('/api/analytics/collect', new Blob([payload], { type: 'application/json' }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
    };
  }, [pathname]);

  return null;
}
