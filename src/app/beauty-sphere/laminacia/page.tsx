import { notFound } from "next/navigation";
import BeautyCategoryPage from "@/app/beauty-sphere/components/BeautyCategoryPage";
import { getBeautyCategoryWithPrices } from "@/app/lib/beautyServices";

export default async function LaminaciaPage() {
  const category = await getBeautyCategoryWithPrices("laminacia");
  if (!category) notFound();
  return <BeautyCategoryPage category={category} />;
}
