import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  date: string;
  timestamp: Date;
}

// Sample reviews for testing
const sampleReviews: GoogleReview[] = [
  {
    authorName: "Karin Alexyová",
    rating: 5,
    text: "Profesionálny prístup, skvelá komunikácia a úžasný výsledok. Odporúčam!",
    date: "pred 2 mesiacmi",
    timestamp: new Date()
  },
  {
    authorName: "Sofia",
    rating: 5,
    text: "Skvelá skúsenosť, odporúčam!",
    date: "pred 3 mesiacmi",
    timestamp: new Date()
  },
  {
    authorName: "Veronika Gunišová",
    rating: 5,
    text: "Odporúčam 11/10",
    date: "pred 4 mesiacmi",
    timestamp: new Date()
  },
  {
    authorName: "Katarína Benkovská",
    rating: 5,
    text: "Skvelá práca, príjemné prostredie, odporúčam!",
    date: "pred 5 mesiacmi",
    timestamp: new Date()
  },
  {
    authorName: "Beti S.",
    rating: 5,
    text: "Príjemné prostredie, pohodlie a kvalitná starostlivosť. Odporúčam!",
    date: "pred 6 mesiacmi",
    timestamp: new Date()
  }
];

async function syncGoogleReviews() {
  console.log('Starting Google reviews sync with sample data...');
  let totalProcessed = 0;

  try {
    for (const review of sampleReviews) {
      const reviewId = `${review.authorName}-${review.timestamp.getTime()}`;
      
      try {
        // @ts-expect-error - Prisma client is generated and this property exists at runtime
        await prisma.googleReview.upsert({
          where: { reviewId },
          update: {
            authorName: review.authorName,
            rating: review.rating,
            text: review.text,
            date: review.date,
            timestamp: review.timestamp
          },
          create: {
            reviewId,
            authorName: review.authorName,
            rating: review.rating,
            text: review.text,
            date: review.date,
            timestamp: review.timestamp
          }
        });
        totalProcessed++;
        console.log(`Processed review from ${review.authorName}`);
      } catch (error) {
        console.error(`Error processing review ${reviewId}:`, error);
      }
    }

    console.log(`Successfully synced ${totalProcessed} reviews`);
  } catch (error) {
    console.error('Error syncing reviews:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncGoogleReviews()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to sync reviews:', error);
      process.exit(1);
    });
} 