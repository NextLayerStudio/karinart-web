import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB` 
      }, { status: 400 });
    }

    // Check file type
    const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only WebP, JPEG, JPG, PNG, HEIC, and HEIF are allowed' 
      }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      return NextResponse.json({ error: 'Failed to convert file to buffer' }, { status: 400 });
    }

    // Convert image to WebP using sharp
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();

    if (!Buffer.isBuffer(webpBuffer) || webpBuffer.length === 0) {
      return NextResponse.json({ error: 'WebP conversion failed' }, { status: 500 });
    }

    // Generate safe random filename with .webp extension
    const randomId = randomUUID();
    const safeFileName = `freedesign_${Date.now()}_${randomId}.webp`;

    // Upload to Vercel Blob
    const { url } = await put(safeFileName, webpBuffer, {
      contentType: 'image/webp',
      access: 'public',
    });

    // Save to database
    const freeDesign = await prisma.freeDesign.create({
      data: {
        imageUrl: url,
        title: title,
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      design: {
        ...freeDesign,
        createdAt: freeDesign.createdAt.toISOString(),
        updatedAt: freeDesign.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error uploading free design:', error);
    return NextResponse.json(
      { error: 'Failed to upload free design' },
      { status: 500 }
    );
  }
}


