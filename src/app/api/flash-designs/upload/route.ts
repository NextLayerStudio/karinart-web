import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for image processing

interface UploadedImage {
  id: string;
  imageUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Flash design upload request received');
    
    // Verify environment variables
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return NextResponse.json(
        { 
          success: false,
          error: 'Blob storage is not configured. Please check environment variables.' 
        },
        { status: 503 }
      );
    }
    
    // Check database connection
    try {
      await prisma.$connect();
      console.log('Database connection verified');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection failed. Please check database configuration.' 
        },
        { status: 503 }
      );
    }
    
    // Check authentication
    const user = await getAdminUser();
    if (!user) {
      console.error('Unauthorized upload attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('User authenticated:', user.name);

    // Parse multipart form data
    console.log('Parsing form data...');
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const prices = formData.getAll('prices') as string[];
    const titles = formData.getAll('titles') as string[];

    console.log('Form data parsed:', {
      fileCount: files.length,
      priceCount: prices.length,
      titleCount: titles.length
    });

    if (!files || files.length === 0) {
      console.error('No files provided');
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 10) {
      console.error('Too many files:', files.length);
      return NextResponse.json({ error: 'Maximum 10 files allowed per upload' }, { status: 400 });
    }

    const uploadedImages: UploadedImage[] = [];
    const errors: string[] = [];

    // Process each file sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const priceStr = prices[i] || '0';
      const price = parseFloat(priceStr);
      const title = titles[i] || file.name.replace(/\.[^/.]+$/, ''); // Use custom title or fallback to filename

      try {
        console.log(`Processing file ${i + 1}:`, {
          name: file?.name,
          size: file?.size,
          type: file?.type,
          price: priceStr,
          title: titles[i]
        });

        // Validate file
        if (!file || file.size === 0) {
          errors.push(`File ${i + 1}: Empty or invalid file`);
          continue;
        }

        // Validate price
        if (isNaN(price) || price < 0) {
          errors.push(`File ${i + 1}: Invalid price. Must be a positive number`);
          continue;
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          errors.push(`File ${i + 1}: File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB`);
          continue;
        }

        // Check file type
        const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
        if (!validTypes.includes(file.type)) {
          errors.push(`File ${i + 1}: Invalid file type. Only WebP, JPEG, JPG, PNG, HEIC, and HEIF are allowed`);
          continue;
        }

        console.log(`File ${i + 1} validation passed, converting to buffer...`);

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
          errors.push(`File ${i + 1}: Failed to convert file to buffer`);
          continue;
        }

        console.log(`File ${i + 1} buffer created:`, {
          bufferSize: buffer.length,
          originalSize: file.size
        });

        // Convert image to WebP using sharp
        console.log(`File ${i + 1} converting to WebP...`);
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 80 })
          .toBuffer();

        if (!Buffer.isBuffer(webpBuffer) || webpBuffer.length === 0) {
          errors.push(`File ${i + 1}: WebP conversion failed`);
          continue;
        }

        console.log(`File ${i + 1} WebP conversion successful:`, {
          originalSize: buffer.length,
          webpSize: webpBuffer.length
        });

        // Generate safe random filename with .webp extension
        const randomId = randomUUID();
        const safeFileName = `flash_${Date.now()}_${randomId}.webp`;

        console.log(`File ${i + 1} uploading to Vercel Blob:`, {
          filename: safeFileName,
          bufferSize: webpBuffer.length
        });

        // Upload to Vercel Blob
        let url: string;
        try {
          const blobResult = await put(safeFileName, webpBuffer, {
            contentType: 'image/webp',
            access: 'public',
          });
          url = blobResult.url;
          console.log(`File ${i + 1} upload successful:`, { url });
        } catch (blobError) {
          console.error(`File ${i + 1} Vercel Blob upload failed:`, blobError);
          throw new Error(`Blob upload failed: ${blobError instanceof Error ? blobError.message : 'Unknown error'}`);
        }

        // Store in database with title and price
        console.log(`File ${i + 1} saving to database...`);
        let flashDesign;
        try {
          flashDesign = await prisma.flashDesign.create({
            data: {
              imageUrl: url,
              title: title, // Use custom title from form data
              price: price,
            },
          });
          console.log(`File ${i + 1} database record created:`, { id: flashDesign.id });
        } catch (dbError) {
          console.error(`File ${i + 1} database save failed:`, dbError);
          throw new Error(`Database save failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        }

        uploadedImages.push({
          id: flashDesign.id,
          imageUrl: flashDesign.imageUrl,
        });

      } catch (fileError) {
        console.error(`Error processing file ${i + 1}:`, fileError);
        const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
        errors.push(`File ${i + 1}: Upload failed - ${errorMessage}`);
      }
    }

    // Return response
    if (uploadedImages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files were uploaded successfully',
        errors,
      }, { status: 400 });
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: true,
        uploaded: uploadedImages,
        errors,
        message: `${uploadedImages.length} file(s) uploaded successfully, ${errors.length} file(s) failed`,
      }, { status: 207 });
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedImages,
    });

  } catch (error) {
    console.error('Flash design upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'An error occurred while processing the upload',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
