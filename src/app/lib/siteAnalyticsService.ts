import prisma from '@/app/lib/prisma';

export interface AnalyticsEventInput {
  sessionId: string;
  eventType: string;
  path: string;
  target?: string | null;
  element?: string | null;
  label?: string | null;
  section?: string | null;
  referrer?: string | null;
  viewport?: string | null;
}

const ALLOWED_EVENT_TYPES = new Set(['pageview', 'click', 'scroll_depth']);

function truncate(value: string | null | undefined, max: number): string | null {
  if (!value) {
    return null;
  }
  return value.slice(0, max);
}

export function sanitizeAnalyticsEvents(events: AnalyticsEventInput[]): AnalyticsEventInput[] {
  return events
    .filter((event) => {
      if (!event.sessionId || !event.path || !event.eventType) {
        return false;
      }
      if (!ALLOWED_EVENT_TYPES.has(event.eventType)) {
        return false;
      }
      if (!event.path.startsWith('/') || event.path.startsWith('/admin')) {
        return false;
      }
      return event.sessionId.length <= 64;
    })
    .slice(0, 50)
    .map((event) => ({
      sessionId: truncate(event.sessionId, 64)!,
      eventType: event.eventType,
      path: truncate(event.path, 300)!,
      target: truncate(event.target ?? null, 500),
      element: truncate(event.element ?? null, 50),
      label: truncate(event.label ?? null, 200),
      section: truncate(event.section ?? null, 100),
      referrer: truncate(event.referrer ?? null, 500),
      viewport: truncate(event.viewport ?? null, 20),
    }));
}

export async function storeAnalyticsEvents(events: AnalyticsEventInput[]): Promise<number> {
  const sanitized = sanitizeAnalyticsEvents(events);
  if (sanitized.length === 0) {
    return 0;
  }

  await prisma.siteAnalyticsEvent.createMany({
    data: sanitized.map((event) => ({
      sessionId: event.sessionId,
      eventType: event.eventType,
      path: event.path,
      target: event.target,
      element: event.element,
      label: event.label,
      section: event.section,
      referrer: event.referrer,
      viewport: event.viewport,
    })),
  });

  return sanitized.length;
}

function getSinceDate(days: number): Date {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);
  return since;
}

function normalizeInternalPath(href: string | null | undefined): string | null {
  if (!href || !href.startsWith('/')) {
    return null;
  }
  const path = href.split('?')[0]?.split('#')[0];
  if (!path || path.startsWith('/admin')) {
    return null;
  }
  return path;
}

export async function getAnalyticsDashboard(days: number) {
  const since = getSinceDate(days);

  const events = await prisma.siteAnalyticsEvent.findMany({
    where: { createdAt: { gte: since } },
    select: {
      sessionId: true,
      eventType: true,
      path: true,
      target: true,
      label: true,
      element: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const sessions = new Set<string>();
  let pageviews = 0;
  let clicks = 0;

  const pageViewCounts = new Map<string, number>();
  const pageSessionCounts = new Map<string, Set<string>>();
  const clickCounts = new Map<string, { path: string; label: string; target: string; count: number }>();
  const navigationFlows = new Map<string, number>();
  const sessionPageCounts = new Map<string, number>();
  const sessionPaths = new Map<string, string[]>();

  const funnelSteps = {
    register: new Set<string>(),
    verifyEmail: new Set<string>(),
    customerLogin: new Set<string>(),
    customerProgram: new Set<string>(),
    tattooAppointment: new Set<string>(),
    beautyAppointment: new Set<string>(),
    beautyBookingSubmit: new Set<string>(),
  };

  for (const event of events) {
    sessions.add(event.sessionId);

    if (event.eventType === 'pageview') {
      pageviews += 1;
      pageViewCounts.set(event.path, (pageViewCounts.get(event.path) ?? 0) + 1);

      if (!pageSessionCounts.has(event.path)) {
        pageSessionCounts.set(event.path, new Set());
      }
      pageSessionCounts.get(event.path)!.add(event.sessionId);

      sessionPageCounts.set(
        event.sessionId,
        (sessionPageCounts.get(event.sessionId) ?? 0) + 1
      );

      if (!sessionPaths.has(event.sessionId)) {
        sessionPaths.set(event.sessionId, []);
      }
      sessionPaths.get(event.sessionId)!.push(event.path);

      if (event.path === '/register') funnelSteps.register.add(event.sessionId);
      if (event.path === '/verify-email') funnelSteps.verifyEmail.add(event.sessionId);
      if (event.path === '/customer/login') funnelSteps.customerLogin.add(event.sessionId);
      if (event.path.startsWith('/customer-program')) funnelSteps.customerProgram.add(event.sessionId);
      if (event.path === '/appointment') funnelSteps.tattooAppointment.add(event.sessionId);
      if (event.path.startsWith('/beauty-sphere/appointment')) {
        funnelSteps.beautyAppointment.add(event.sessionId);
      }
    }

    if (event.eventType === 'click') {
      clicks += 1;
      const key = `${event.path}::${event.label ?? ''}::${event.target ?? ''}`;
      const existing = clickCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        clickCounts.set(key, {
          path: event.path,
          label: event.label ?? '(bez textu)',
          target: event.target ?? '',
          count: 1,
        });
      }

      const destination = normalizeInternalPath(event.target);
      if (destination) {
        const flowKey = `${event.path} → ${destination}`;
        navigationFlows.set(flowKey, (navigationFlows.get(flowKey) ?? 0) + 1);
      }

      if (
        event.path.startsWith('/beauty-sphere/appointment') &&
        (event.label?.toLowerCase().includes('odosla') ||
          event.label?.toLowerCase().includes('rezerv'))
      ) {
        funnelSteps.beautyBookingSubmit.add(event.sessionId);
      }
    }
  }

  const topPages = [...pageViewCounts.entries()]
    .map(([path, views]) => ({
      path,
      views,
      uniqueSessions: pageSessionCounts.get(path)?.size ?? 0,
      clicks: [...clickCounts.values()]
        .filter((click) => click.path === path)
        .reduce((sum, click) => sum + click.count, 0),
      clickRate: views > 0
        ? Number(
            (
              ([...clickCounts.values()]
                .filter((click) => click.path === path)
                .reduce((sum, click) => sum + click.count, 0) /
                views) *
              100
            ).toFixed(1)
          )
        : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  const topClicks = [...clickCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 25)
    .map((click) => {
      const pageViews = pageViewCounts.get(click.path) ?? 0;
      return {
        ...click,
        ctr: pageViews > 0 ? Number(((click.count / pageViews) * 100).toFixed(1)) : 0,
      };
    });

  const navigation = [...navigationFlows.entries()]
    .map(([flow, count]) => {
      const [from, to] = flow.split(' → ');
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const bouncePages = new Map<string, number>();
  for (const [sessionId, count] of sessionPageCounts.entries()) {
    if (count === 1) {
      const path = sessionPaths.get(sessionId)?.[0];
      if (path) {
        bouncePages.set(path, (bouncePages.get(path) ?? 0) + 1);
      }
    }
  }

  const highBouncePages = [...bouncePages.entries()]
    .map(([path, bounces]) => ({
      path,
      bounces,
      bounceRate:
        (pageSessionCounts.get(path)?.size ?? 0) > 0
          ? Number(
              (
                (bounces / (pageSessionCounts.get(path)?.size ?? 1)) *
                100
              ).toFixed(1)
            )
          : 0,
    }))
    .sort((a, b) => b.bounces - a.bounces)
    .slice(0, 15);

  const lowEngagementPages = topPages
    .filter((page) => page.views >= 10 && page.clickRate < 5)
    .slice(0, 10);

  const countFunnel = (sessionsInStep: Set<string>, previous?: Set<string>) => {
    const count = sessionsInStep.size;
    const conversion =
      previous && previous.size > 0
        ? Number(((count / previous.size) * 100).toFixed(1))
        : null;
    return { count, conversion };
  };

  return {
    periodDays: days,
    summary: {
      sessions: sessions.size,
      pageviews,
      clicks,
      avgPagesPerSession:
        sessions.size > 0 ? Number((pageviews / sessions.size).toFixed(1)) : 0,
      avgClicksPerSession:
        sessions.size > 0 ? Number((clicks / sessions.size).toFixed(1)) : 0,
    },
    topPages,
    topClicks,
    navigation,
    highBouncePages,
    lowEngagementPages,
    funnels: {
      registration: [
        { step: 'Registrácia', ...countFunnel(funnelSteps.register) },
        {
          step: 'Overenie e-mailu',
          ...countFunnel(funnelSteps.verifyEmail, funnelSteps.register),
        },
      ],
      customerZone: [
        { step: 'Prihlásenie', ...countFunnel(funnelSteps.customerLogin) },
        {
          step: 'Zákaznícka zóna',
          ...countFunnel(funnelSteps.customerProgram, funnelSteps.customerLogin),
        },
      ],
      tattooBooking: [{ step: 'Rezervácia tetovania', ...countFunnel(funnelSteps.tattooAppointment) }],
      beautyBooking: [
        { step: 'Beauty rezervácia', ...countFunnel(funnelSteps.beautyAppointment) },
        {
          step: 'Odoslanie formulára',
          ...countFunnel(funnelSteps.beautyBookingSubmit, funnelSteps.beautyAppointment),
        },
      ],
    },
  };
}
