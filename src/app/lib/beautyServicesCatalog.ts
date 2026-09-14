export interface BeautyBookableService {
  id: string;
  categorySlug: "laminacia" | "osetrenia-pleti";
  title: string;
  priceEUR: number | null;
  durationHours: number;
  description: string;
  note?: string;
  images?: string[];
}

export const beautyBookableServices: BeautyBookableService[] = [
  {
    id: "laminacia-ras",
    categorySlug: "laminacia",
    title: "Laminácia rias",
    priceEUR: 30,
    durationHours: 1,
    description:
      "Šetrné ošetrenie, ktoré natočí, opticky predĺži a zvýrazní prirodzené riasy bez potreby umelých rias. Súčasťou ošetrenia je aj výživa rias. Efekt vydrží niekoľko týždňov.",
    images: ["/images/beauty/lashlift.png"],
  },
  {
    id: "farbenie-ras",
    categorySlug: "laminacia",
    title: "Farbenie rias",
    priceEUR: 8,
    durationHours: 0.5,
    description: "Jemné farbenie rias pre zvýraznenie prirodzeného pohľadu.",
  },
  {
    id: "korejska-laminacia",
    categorySlug: "laminacia",
    title: "Kórejská laminácia",
    priceEUR: 35,
    durationHours: 1,
    description:
      "Moderná kórejská technika laminácie s dôrazom na prirodzený efekt, hydratáciu a zdravý vzhľad rias alebo obočia.",
    images: ["/images/beauty/korejsky-lashlift.png", "/images/beauty/korejsky-lashlift-1.jpg"],
  },
  {
    id: "korejska-laminacia-obocie-ras",
    categorySlug: "laminacia",
    title: "Kórejská laminácia obočia + rias",
    priceEUR: 55,
    durationHours: 1.5,
    description:
      "Kombinované kórejské ošetrenie obočia a rias v jednom termíne — upravený, prirodzený a elegantný vzhľad.",
  },
  {
    id: "laminacia-obocia",
    categorySlug: "laminacia",
    title: "Laminácia obočia",
    priceEUR: 30,
    durationHours: 1,
    description:
      "Profesionálne ošetrenie, ktoré zvýrazní prirodzený tvar obočia a zabezpečí jeho dlhodobé upravenie.",
    images: ["/images/beauty/laminacia-obocia.jpg"],
  },
  {
    id: "farbenie-obocia",
    categorySlug: "laminacia",
    title: "Farbenie obočia",
    priceEUR: 10,
    durationHours: 0.5,
    description: "Farbenie obočia pre zvýraznenie tvaru a prirodzenejší vzhľad.",
  },
  {
    id: "laminacia-ras-obocie",
    categorySlug: "laminacia",
    title: "Laminácia mihalníc + obočia",
    priceEUR: 50,
    durationHours: 1.5,
    description:
      "Kombinované ošetrenie laminácie rias a obočia v jednom termíne pre komplexne upravený vzhľad.",
  },
  {
    id: "restart-pleti",
    categorySlug: "osetrenia-pleti",
    title: "Ošetrenie Reštart pleti",
    priceEUR: 60,
    durationHours: 1,
    description:
      "Intenzívne revitalizačné ošetrenie určené pre oslabenú, dehydratovanú pleť. Kombinácia vitamínov a hydratačných látok pomáha obnoviť rovnováhu a jas pleti.",
  },
  {
    id: "kolag-nite",
    categorySlug: "osetrenia-pleti",
    title: "Kolagénové nite",
    priceEUR: 85,
    durationHours: 2,
    description:
      "Intenzívne omladzujúce ošetrenie, ktoré stimuluje tvorbu vlastného kolagénu v pokožke. Výsledkom je pevnejšia pleť s liftingovým efektom.",
    note: "Odporúčanie: intenzívny reštart pleti s 3–4 ošetreniami s odstupom 1–2 týždne.",
    images: [
      "/images/beauty/kolag-nov-nite.png",
      "/images/beauty/kolag-nov-nite-1.png",
      "/images/beauty/kolag-nov-nite-1-1.png",
      "/images/beauty/kolag-nov-nite-1-2.png",
      "/images/beauty/kolag-nov-nite-1-3.png",
      "/images/beauty/kolag-nov-nite-1-4.png",
      "/images/beauty/kolag-nov-nite-2.png",
      "/images/beauty/kolag-nov-nite-2-3.png",
    ],
  },
  {
    id: "kobido-fillift",
    categorySlug: "osetrenia-pleti",
    title: "KOBIDO + Fillfit",
    priceEUR: 80,
    durationHours: 1.5,
    description:
      "Luxusné ošetrenie s okamžitým liftingovým efektom a japonskou KOBIDO masážou. Ideálne pred dôležitou udalosťou.",
  },
  {
    id: "retinol",
    categorySlug: "osetrenia-pleti",
    title: "Retinolové ošetrenie",
    priceEUR: 55,
    durationHours: 1,
    description:
      "Intenzívne regeneračné ošetrenie s retinolom pre obnovu buniek, zjemnenie vrások a zlepšenie textúry pleti.",
    images: ["/images/beauty/retinol.png"],
  },
  {
    id: "dermaneoxin",
    categorySlug: "osetrenia-pleti",
    title: "Dermaneoxin",
    priceEUR: 65,
    durationHours: 1.5,
    description:
      "Moderné ošetrenie zamerané na redukciu mimických vrások s „botox-like“ efektom bez ihiel. Pleť je svieža, rozjasnená a omladená.",
    images: ["/images/beauty/dermaneoxin.png", "/images/beauty/dermaneoxin-1.png"],
  },
  {
    id: "aknozna-plet",
    categorySlug: "osetrenia-pleti",
    title: "Ošetrenie pre aknóznu alebo zápalenú pokožku",
    priceEUR: 50,
    durationHours: 1,
    description:
      "Odborné ošetrenie pre problematickú pleť so zameraním na čistenie pórov, reguláciu mazu a upokojenie zápalov.",
  },
  {
    id: "thea",
    categorySlug: "osetrenia-pleti",
    title: "Ošetrenie s THEA prístrojom",
    priceEUR: 60,
    durationHours: 1,
    description:
      "Pokročilé prístrojové ošetrenie pre hydratáciu, spevnenie a lifting pleti. Podporuje tvorbu kolagénu a elastínu.",
  },
  {
    id: "na-mieru",
    categorySlug: "osetrenia-pleti",
    title: "Ošetrenie na mieru",
    priceEUR: null,
    durationHours: 1,
    description:
      "Individuálne ošetrenie prispôsobené aktuálnym potrebám vašej pleti po dôkladnej diagnostike.",
  },
  {
    id: "carboxy-decaar",
    categorySlug: "osetrenia-pleti",
    title: "Carboxy ošetrenie DÉCAAR",
    priceEUR: 55,
    durationHours: 1,
    description:
      "Carboxy ošetrenie DÉCAAR je neinvazívna procedúra, ktorá intenzívne regeneruje, okysličuje a revitalizuje pleť. Podporuje mikrocirkuláciu, stimuluje prirodzenú tvorbu kolagénu a pomáha obnoviť pevnosť, pružnosť a zdravý jas pokožky. Medzi benefity ošetrenia patrí redukcia vrások, spevnenie a hydratácia pleti, zjednotenie tónu a rozjasnenie, zlepšenie elasticity a podpora prirodzenej regenerácie a tvorby kolagénu.",
  },
  {
    id: "algae-peeling",
    categorySlug: "osetrenia-pleti",
    title: "Algae peeling",
    priceEUR: 60,
    durationHours: 1,
    description:
      "Profesionálny peeling z lúpaných rias, ktorý exfoliuje pokožku a poskytuje žiarivú a osvieženú pleť. Eliminuje čierne bodky a drsnosť, stimuluje prietok krvi a pomáha pri začervenaní, opuchnutí a povrchových vráskach. Kombinácia prírodných zložiek na báze byliniek z rias a perfluorokarbónu je vhodná aj pre najcitlivejšiu pokožku a pomáha pri akné, poškodenej a mastnej pokožke, vráskach a ochabnutej pokožke, suchej pokožke, pigmentáciách a starnutí, jazvách aj rozšírených póroch. Odstraňuje odumreté bunky, posilňuje pokožku a zanecháva pleť vyplnenú, čistú a žiarivú, znižuje zápaly a zlepšuje krvný obeh.",
  },
];

export function getBeautyBookableService(id: string): BeautyBookableService | undefined {
  return beautyBookableServices.find((service) => service.id === id);
}

export function formatBeautyPrice(priceEUR: number | null): string {
  if (priceEUR == null) {
    return "Individuálna cena";
  }
  return `${priceEUR} €`;
}

export function formatBeautyDuration(durationHours: number): string {
  if (durationHours === 0.5) {
    return "30 min";
  }
  if (durationHours === 1) {
    return "1 hodina";
  }
  if (durationHours === 1.5) {
    return "1,5 hodiny";
  }
  if (Number.isInteger(durationHours)) {
    return `${durationHours} hodiny`;
  }
  return `${String(durationHours).replace(".", ",")} hodiny`;
}

export function getServicesByCategory(categorySlug: string): BeautyBookableService[] {
  return beautyBookableServices.filter((service) => service.categorySlug === categorySlug);
}
