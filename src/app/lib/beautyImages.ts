const BEAUTY_IMG = "/images/beauty";

export interface BeautyPortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
}

/** Static beauty gallery — served from /public/images/beauty */
export const beautyPortfolioImages: BeautyPortfolioItem[] = [
  { id: "dermaneoxin", imageUrl: `${BEAUTY_IMG}/dermaneoxin.png`, title: "SynCare Dermaneoxin", category: "osetrenia-pleti" },
  { id: "dermaneoxin-1", imageUrl: `${BEAUTY_IMG}/dermaneoxin-1.png`, title: "SynCare Dermaneoxin", category: "osetrenia-pleti" },
  { id: "kolagenove-nite", imageUrl: `${BEAUTY_IMG}/kolag-nov-nite.png`, title: "SynCare Kolagénové nite", category: "osetrenia-pleti" },
  { id: "kolagenove-nite-1", imageUrl: `${BEAUTY_IMG}/kolag-nov-nite-1.png`, title: "SynCare Kolagénové nite", category: "osetrenia-pleti" },
  { id: "kolagenove-nite-1-1", imageUrl: `${BEAUTY_IMG}/kolag-nov-nite-1-1.png`, title: "SynCare Kolagénové nite", category: "osetrenia-pleti" },
  { id: "kolagenove-nite-1-2", imageUrl: `${BEAUTY_IMG}/kolag-nov-nite-1-2.png`, title: "SynCare Kolagénové nite", category: "osetrenia-pleti" },
  { id: "kolagenove-nite-1-3", imageUrl: `${BEAUTY_IMG}/kolag-nov-nite-1-3.png`, title: "SynCare Kolagénové nite", category: "osetrenia-pleti" },
  { id: "kolagenove-nite-1-4", imageUrl: `${BEAUTY_IMG}/kolag-nov-nite-1-4.png`, title: "SynCare Kolagénové nite", category: "osetrenia-pleti" },
  { id: "kolagenove-nite-2", imageUrl: `${BEAUTY_IMG}/kolag-nov-nite-2.png`, title: "SynCare Kolagénové nite", category: "osetrenia-pleti" },
  { id: "kolagenove-nite-2-3", imageUrl: `${BEAUTY_IMG}/kolag-nov-nite-2-3.png`, title: "SynCare Kolagénové nite", category: "osetrenia-pleti" },
  { id: "retinol", imageUrl: `${BEAUTY_IMG}/retinol.png`, title: "SynCare Retinol", category: "osetrenia-pleti" },
  { id: "laminacia-obocia", imageUrl: `${BEAUTY_IMG}/laminacia-obocia.jpg`, title: "Laminácia obočia", category: "laminacia" },
  { id: "lashlift", imageUrl: `${BEAUTY_IMG}/lashlift.png`, title: "Laminácia rias", category: "laminacia" },
  { id: "korejsky-lashlift", imageUrl: `${BEAUTY_IMG}/korejsky-lashlift.png`, title: "Kórejská technika laminácie", category: "laminacia" },
  { id: "korejsky-lashlift-1", imageUrl: `${BEAUTY_IMG}/korejsky-lashlift-1.jpg`, title: "Kórejská technika laminácie", category: "laminacia" },
  { id: "microblading", imageUrl: `${BEAUTY_IMG}/microblading.png`, title: "Microblading obočia", category: "permanentny-make-up" },
  { id: "microblading-1", imageUrl: `${BEAUTY_IMG}/microblading-1.png`, title: "Microblading obočia", category: "permanentny-make-up" },
  { id: "microblading-2", imageUrl: `${BEAUTY_IMG}/microblading-2.png`, title: "Microblading obočia", category: "permanentny-make-up" },
  { id: "pmu-pier", imageUrl: `${BEAUTY_IMG}/pmu-pier.png`, title: "Permanentný make-up pier", category: "permanentny-make-up" },
];

export function getCategoryCoverImage(slug: string): string | undefined {
  return beautyPortfolioImages.find((img) => img.category === slug)?.imageUrl;
}

export function getCategoryImages(slug: string): string[] {
  return beautyPortfolioImages.filter((img) => img.category === slug).map((img) => img.imageUrl);
}
