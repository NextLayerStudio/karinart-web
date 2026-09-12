import prisma from '@/app/lib/prisma';

const SETTINGS_ID = 'singleton';

export async function getSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: { id: SETTINGS_ID } });
}

export async function isInkProgramEnabled(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.inkProgramEnabled;
}

export async function setInkProgramEnabled(enabled: boolean) {
  return prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { inkProgramEnabled: enabled },
    create: { id: SETTINGS_ID, inkProgramEnabled: enabled },
  });
}
