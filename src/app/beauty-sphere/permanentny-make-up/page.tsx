import { notFound } from "next/navigation";
import BeautyCategoryPage from "@/app/beauty-sphere/components/BeautyCategoryPage";
import { getBeautyCategory } from "@/app/lib/beautyServices";

export default function PermanentnyMakeUpPage() {
  const category = getBeautyCategory("permanentny-make-up");
  if (!category) notFound();
  return <BeautyCategoryPage category={category} />;
}
