import {
  beautyBookableServices,
  getServicesByCategory,
  type BeautyBookableService,
} from "@/app/lib/beautyServicesCatalog";
import { getMergedBeautyBookableServices } from "@/app/lib/beautyPriceService";

export interface BeautyService {
  id?: string;
  title: string;
  description: string;
  note?: string;
  images?: string[];
  priceEUR?: number | null;
  durationHours?: number;
  bookable?: boolean;
}

export interface BeautyCategory {
  slug: string;
  title: string;
  navLabel: string;
  subtitle: string;
  intro: string;
  services: BeautyService[];
}

function mapCatalogToDisplay(service: BeautyBookableService): BeautyService {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    note: service.note,
    images: service.images,
    priceEUR: service.priceEUR,
    durationHours: service.durationHours,
    bookable: true,
  };
}

const laminaciaServices = getServicesByCategory("laminacia").map(mapCatalogToDisplay);
const osetreniaServices = getServicesByCategory("osetrenia-pleti").map(mapCatalogToDisplay);

export const beautyCategories: BeautyCategory[] = [
  {
    slug: "osetrenia-pleti",
    title: "Ošetrenia pleti",
    navLabel: "Ošetrenia pleti",
    subtitle: "Profesionálna starostlivosť, omladenie a regenerácia pleti",
    intro:
      "SynCare a prémiové protokoly pre hydratáciu, lifting, čistenie aj individuálnu starostlivosť podľa aktuálnych potrieb vašej pleti.",
    services: osetreniaServices,
  },
  {
    slug: "laminacia",
    title: "Laminácia",
    navLabel: "Laminácia",
    subtitle: "Obočie a riasy s prirodzeným, elegantným efektom",
    intro:
      "Šetrné ošetrenia obočia a rias vrátane kórejskej techniky — pre upravený vzhľad bez prehnaného efektu.",
    services: laminaciaServices,
  },
  {
    slug: "permanentny-make-up",
    title: "Permanentný make-up",
    navLabel: "Permanentný make-up",
    subtitle: "Obočie a pery s prirodzeným, dlhotrvajúcim efektom",
    intro:
      "Semi-permanentné techniky pre zvýraznenie obočia a pier — vždy individuálne prispôsobené vašim črtám.",
    services: [
      {
        title: "Microblading obočia – prirodzene dokonalé obočie",
        description:
          "Precízna semi-permanentná technika úpravy obočia, pri ktorej sa jemnými ťahmi vytvára efekt prirodzených chĺpkov. Microblading je ideálny pre klientky, ktoré túžia po hustejšom, symetrickom a prirodzene upravenom obočí. Tvar a odtieň obočia sú vždy individuálne prispôsobené črtám tváre a prirodzenému vzhľadu klientky. Výsledkom je elegantné, prirodzene pôsobiace obočie, ktoré zvýrazní tvár a zjednoduší každodenné líčenie.",
        images: [
          "/images/beauty/microblading.png",
          "/images/beauty/microblading-1.png",
          "/images/beauty/microblading-2.png",
        ],
        bookable: false,
      },
      {
        title: "Permanentný make-up pier – zvýraznenie prirodzenej krásy",
        description:
          "Permanentný make-up pier dodáva perám jemne definovaný tvar, sviežu farbu a opticky plnší vzhľad. Ošetrenie je vhodné pre klientky, ktoré chcú zvýrazniť kontúru pier, zjednotiť ich farebný tón alebo dosiahnuť upravený vzhľad bez každodenného líčenia. Používajú sa kvalitné pigmenty a individuálne zvolený odtieň tak, aby výsledok pôsobil prirodzene a harmonicky. Pery sú po zahojení jemne zvýraznené, svieže a elegantné.",
        images: ["/images/beauty/pmu-pier.png"],
        bookable: false,
      },
    ],
  },
];

export function getBeautyCategory(slug: string): BeautyCategory | undefined {
  return beautyCategories.find((category) => category.slug === slug);
}

export async function getBeautyCategoryWithPrices(
  slug: string
): Promise<BeautyCategory | undefined> {
  const mergedServices = await getMergedBeautyBookableServices();
  const category = beautyCategories.find((item) => item.slug === slug);

  if (!category) {
    return undefined;
  }

  if (slug === "permanentny-make-up") {
    return category;
  }

  const services = mergedServices
    .filter((service) => service.categorySlug === slug)
    .map(mapCatalogToDisplay);

  return {
    ...category,
    services,
  };
}

export { beautyBookableServices };
