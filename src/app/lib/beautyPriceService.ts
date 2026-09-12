import prisma from '@/app/lib/prisma';
import {
  beautyBookableServices,
  type BeautyBookableService,
} from '@/app/lib/beautyServicesCatalog';

export interface BeautyPriceOverride {
  serviceId: string;
  priceEUR: number | null;
  durationHours: number;
}

async function getPriceOverridesMap(): Promise<Map<string, BeautyPriceOverride>> {
  const rows = await prisma.beautyServicePrice.findMany();
  return new Map(
    rows.map((row) => [
      row.serviceId,
      {
        serviceId: row.serviceId,
        priceEUR: row.priceEUR,
        durationHours: row.durationHours,
      },
    ])
  );
}

function mergeService(
  service: BeautyBookableService,
  override?: BeautyPriceOverride
): BeautyBookableService {
  if (!override) {
    return service;
  }

  return {
    ...service,
    priceEUR: override.priceEUR,
    durationHours: override.durationHours,
  };
}

export async function ensureBeautyPricesSeeded(): Promise<void> {
  const count = await prisma.beautyServicePrice.count();
  if (count > 0) {
    return;
  }

  await prisma.beautyServicePrice.createMany({
    data: beautyBookableServices.map((service) => ({
      serviceId: service.id,
      priceEUR: service.priceEUR,
      durationHours: service.durationHours,
    })),
    skipDuplicates: true,
  });
}

export async function getMergedBeautyBookableServices(): Promise<BeautyBookableService[]> {
  await ensureBeautyPricesSeeded();
  const overrides = await getPriceOverridesMap();

  return beautyBookableServices.map((service) =>
    mergeService(service, overrides.get(service.id))
  );
}

export async function getMergedBeautyBookableService(
  id: string
): Promise<BeautyBookableService | undefined> {
  const services = await getMergedBeautyBookableServices();
  return services.find((service) => service.id === id);
}

export async function getBeautyPriceOverridesForAdmin(): Promise<
  Array<{
    serviceId: string;
    title: string;
    categorySlug: string;
    priceEUR: number | null;
    durationHours: number;
    catalogPriceEUR: number | null;
    catalogDurationHours: number;
  }>
> {
  await ensureBeautyPricesSeeded();
  const overrides = await getPriceOverridesMap();

  return beautyBookableServices.map((service) => {
    const override = overrides.get(service.id);
    return {
      serviceId: service.id,
      title: service.title,
      categorySlug: service.categorySlug,
      priceEUR: override?.priceEUR ?? service.priceEUR,
      durationHours: override?.durationHours ?? service.durationHours,
      catalogPriceEUR: service.priceEUR,
      catalogDurationHours: service.durationHours,
    };
  });
}

export async function updateBeautyServicePrices(
  updates: Array<{
    serviceId: string;
    priceEUR: number | null;
    durationHours: number;
  }>
): Promise<void> {
  const validIds = new Set(beautyBookableServices.map((service) => service.id));

  for (const update of updates) {
    if (!validIds.has(update.serviceId)) {
      continue;
    }

    if (update.durationHours <= 0 || update.durationHours > 8) {
      throw new Error(`Neplatné trvanie pre službu ${update.serviceId}`);
    }

    if (update.priceEUR != null && (update.priceEUR < 0 || update.priceEUR > 1000)) {
      throw new Error(`Neplatná cena pre službu ${update.serviceId}`);
    }

    await prisma.beautyServicePrice.upsert({
      where: { serviceId: update.serviceId },
      update: {
        priceEUR: update.priceEUR,
        durationHours: update.durationHours,
      },
      create: {
        serviceId: update.serviceId,
        priceEUR: update.priceEUR,
        durationHours: update.durationHours,
      },
    });
  }
}
