import prisma from '../src/app/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function backupFlashDesigns() {
  try {
    console.log('Fetching FlashDesign data...');
    const flashDesigns = await prisma.flashDesign.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const backupData = {
      timestamp: new Date().toISOString(),
      count: flashDesigns.length,
      data: flashDesigns.map(design => ({
        id: design.id,
        imageUrl: design.imageUrl,
        title: design.title,
        price: design.price,
        createdAt: design.createdAt.toISOString(),
        updatedAt: design.updatedAt.toISOString(),
      }))
    };

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `flash-designs-backup-${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    console.log(`✅ Backup created successfully!`);
    console.log(`   File: ${backupFile}`);
    console.log(`   Records: ${flashDesigns.length}`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backupFlashDesigns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

