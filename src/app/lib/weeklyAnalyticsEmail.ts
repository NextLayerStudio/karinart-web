import { sendEmail } from '@/app/lib/emailService';
import { getAnalyticsDashboard } from '@/app/lib/siteAnalyticsService';

const REPORT_RECIPIENT = 'vasekdenis@outlook.com';

function formatDateRange(days: number): string {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  const formatter = new Intl.DateTimeFormat('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTableRows(
  rows: Array<{ label: string; value: string }>
): string {
  return rows
    .map(
      (row) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555;">${escapeHtml(row.label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${escapeHtml(row.value)}</td>
        </tr>`
    )
    .join('');
}

function buildList(items: string[]): string {
  if (items.length === 0) {
    return '<p style="color:#666;margin:0;">Zatiaľ žiadne dáta.</p>';
  }

  return `<ul style="margin:0;padding-left:20px;color:#333;">${items
    .map((item) => `<li style="margin-bottom:6px;">${escapeHtml(item)}</li>`)
    .join('')}</ul>`;
}

export function buildWeeklyAnalyticsEmailHtml(
  dashboard: Awaited<ReturnType<typeof getAnalyticsDashboard>>
): string {
  const summaryRows = [
    { label: 'Relácie', value: String(dashboard.summary.sessions) },
    { label: 'Zobrazenia stránok', value: String(dashboard.summary.pageviews) },
    { label: 'Kliky', value: String(dashboard.summary.clicks) },
    { label: 'Stránky / relácia', value: String(dashboard.summary.avgPagesPerSession) },
    { label: 'Kliky / relácia', value: String(dashboard.summary.avgClicksPerSession) },
  ];

  const topPages = dashboard.topPages
    .slice(0, 10)
    .map(
      (page) =>
        `${page.path} — ${page.views} zobrazení, ${page.clicks} klikov, CTR ${page.clickRate}%`
    );

  const topClicks = dashboard.topClicks
    .slice(0, 10)
    .map(
      (click) =>
        `${click.label} (${click.path}) — ${click.count}×, CTR ${click.ctr}%`
    );

  const navigation = dashboard.navigation
    .slice(0, 10)
    .map((flow) => `${flow.from} → ${flow.to} — ${flow.count}×`);

  const gaps = [
    ...dashboard.lowEngagementPages.map(
      (page) => `Nízka interakcia: ${page.path} (CTR ${page.clickRate}%)`
    ),
    ...dashboard.highBouncePages
      .slice(0, 5)
      .map((page) => `Vysoký bounce: ${page.path} (${page.bounceRate}%)`),
  ];

  const funnelText = [
    ...dashboard.funnels.registration.map(
      (step) =>
        `Registrácia / ${step.step}: ${step.count}${step.conversion != null ? ` (${step.conversion}%)` : ''}`
    ),
    ...dashboard.funnels.customerZone.map(
      (step) =>
        `Zákaznícka zóna / ${step.step}: ${step.count}${step.conversion != null ? ` (${step.conversion}%)` : ''}`
    ),
    ...dashboard.funnels.tattooBooking.map(
      (step) => `Tetovanie / ${step.step}: ${step.count}`
    ),
    ...dashboard.funnels.beautyBooking.map(
      (step) =>
        `Beauty / ${step.step}: ${step.count}${step.conversion != null ? ` (${step.conversion}%)` : ''}`
    ),
  ];

  return `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Týždenná analytika Karin Art</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:680px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#B87FFF 0%,#9B6DFF 100%);padding:32px 24px;color:#fff;">
      <h1 style="margin:0 0 8px;font-size:24px;">Týždenná analytika webu</h1>
      <p style="margin:0;opacity:0.9;">Karin Art · ${escapeHtml(formatDateRange(dashboard.periodDays))}</p>
    </div>
    <div style="padding:24px;">
      <h2 style="margin:0 0 12px;font-size:18px;color:#222;">Prehľad</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${buildTableRows(summaryRows)}
      </table>

      <h2 style="margin:0 0 12px;font-size:18px;color:#222;">Top stránky</h2>
      ${buildList(topPages)}

      <h2 style="margin:24px 0 12px;font-size:18px;color:#222;">Top kliky</h2>
      ${buildList(topClicks)}

      <h2 style="margin:24px 0 12px;font-size:18px;color:#222;">Navigačné toky</h2>
      ${buildList(navigation)}

      <h2 style="margin:24px 0 12px;font-size:18px;color:#222;">Možné medzery v UX</h2>
      ${buildList(gaps)}

      <h2 style="margin:24px 0 12px;font-size:18px;color:#222;">Konverzné cesty</h2>
      ${buildList(funnelText)}
    </div>
    <div style="padding:16px 24px;background:#fafafa;color:#888;font-size:12px;">
      Automatický týždenný report z karinart.sk
    </div>
  </div>
</body>
</html>`;
}

function buildPlainTextReport(
  dashboard: Awaited<ReturnType<typeof getAnalyticsDashboard>>
): string {
  const lines = [
    `Týždenná analytika Karin Art (${formatDateRange(dashboard.periodDays)})`,
    '',
    `Relácie: ${dashboard.summary.sessions}`,
    `Zobrazenia: ${dashboard.summary.pageviews}`,
    `Kliky: ${dashboard.summary.clicks}`,
    `Stránky/relácia: ${dashboard.summary.avgPagesPerSession}`,
    '',
    'Top stránky:',
    ...dashboard.topPages.slice(0, 10).map(
      (page) => `- ${page.path}: ${page.views} zobrazení, CTR ${page.clickRate}%`
    ),
    '',
    'Top kliky:',
    ...dashboard.topClicks.slice(0, 10).map(
      (click) => `- ${click.label} (${click.path}): ${click.count}×`
    ),
  ];

  return lines.join('\n');
}

export async function sendWeeklyAnalyticsReport(): Promise<{
  success: boolean;
  error?: string;
  recipient: string;
}> {
  const dashboard = await getAnalyticsDashboard(7);
  const html = buildWeeklyAnalyticsEmailHtml(dashboard);
  const plainText = buildPlainTextReport(dashboard);

  const result = await sendEmail({
    type: 'analytics_report',
    to: REPORT_RECIPIENT,
    name: 'Denis',
    subject: `Týždenná analytika Karin Art — ${formatDateRange(7)}`,
    customHtml: html,
    message: plainText,
  });

  return {
    ...result,
    recipient: REPORT_RECIPIENT,
  };
}
