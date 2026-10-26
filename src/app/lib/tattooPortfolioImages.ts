import galleryData from "../../../data/supabase-urls.json";

export interface TattooPortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: string;
}

function imageUrlToId(imageUrl: string): string {
  const filename = imageUrl.split("/").pop() ?? imageUrl;
  return filename.replace(/\.[^/.]+$/, "").toLowerCase();
}

/** Static tattoo gallery — served from /public/gallery when DB is empty or unavailable */
export const tattooPortfolioImages: TattooPortfolioItem[] = (
  galleryData.galleryUrls ?? []
).map((imageUrl) => ({
  id: imageUrlToId(imageUrl),
  imageUrl,
  title: "",
  createdAt: new Date(0).toISOString(),
}));
