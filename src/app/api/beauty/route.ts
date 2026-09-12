import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { beautyPortfolioImages } from "@/app/lib/beautyImages";

export async function GET() {
  try {
    const beautyImages = await prisma.beautyImage.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const dbItems = beautyImages.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
    }));

    const dbUrls = new Set(dbItems.map((img) => img.imageUrl));
    const staticItems = beautyPortfolioImages
      .filter((img) => !dbUrls.has(img.imageUrl))
      .map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        title: img.title,
        createdAt: new Date(0).toISOString(),
      }));

    return NextResponse.json([...dbItems, ...staticItems]);
  } catch (error) {
    console.error("Error fetching beauty images:", error);
    const fallback = beautyPortfolioImages.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      title: img.title,
      createdAt: new Date(0).toISOString(),
    }));
    return NextResponse.json(fallback);
  }
}
