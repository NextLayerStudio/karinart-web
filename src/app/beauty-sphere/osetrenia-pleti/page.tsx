import { notFound } from "next/navigation";
import BeautyCategoryPage from "@/app/beauty-sphere/components/BeautyCategoryPage";
import { getBeautyCategoryWithPrices } from "@/app/lib/beautyServices";

export default async function OsetreniaPletiPage() {
  const category = await getBeautyCategoryWithPrices("osetrenia-pleti");
  if (!category) notFound();
  return <BeautyCategoryPage category={category} />;
}
