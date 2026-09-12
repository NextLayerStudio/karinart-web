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

interface UploadedImage {
  id: string;
  imageUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 files allowed per upload' }, { status: 400 });
    }

    const uploadedImages: UploadedImage[] = [];
    const errors: string[] = [];  

    // Process each file sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        console.log(`Processing file ${i + 1}:`, {
          name: file?.name,
          size: file?.size,
          type: file?.type,
          isFile: file instanceof File
        });

        // Check if file exists and is valid
        if (!file) {
          errors.push(`File ${i + 1}: File is missing`);
          continue;
        }

        // Validate file instance
        if (!(file instanceof File)) {
          errors.push(`File ${i + 1}: Invalid file instance - expected File, got ${typeof file}`);
          continue;
        }

        // Validate file size
        if (file.size === 0) {
          errors.push(`File ${i + 1}: Empty file`);
          continue;
        }

        // Check file size (max 10MB for individual files)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          errors.push(`File ${i + 1}: File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB`);
          continue;
        }

        // Check file type
        const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
        if (!validTypes.includes(file.type)) {
          errors.push(`File ${i + 1}: Invalid file type (${file.type}). Only WebP, JPEG, JPG, PNG, HEIC, and HEIF are allowed`);
          continue;
        }

        console.log(`File ${i + 1} validation passed, converting to buffer...`);

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Validate buffer
        if (!Buffer.isBuffer(buffer)) {
          errors.push(`File ${i + 1}: Failed to convert file to buffer - result is not a Buffer`);
          continue;
        }

        if (buffer.length === 0) {
          errors.push(`File ${i + 1}: Buffer is empty after conversion`);
          continue;
        }

        console.log(`File ${i + 1} buffer created:`, {
          bufferSize: buffer.length,
          isBuffer: Buffer.isBuffer(buffer),
          originalSize: file.size
        });

        // Convert image to WebP using sharp
        console.log(`File ${i + 1} converting to WebP...`);
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 80 })
          .toBuffer();

        // Validate WebP conversion
        if (!Buffer.isBuffer(webpBuffer)) {
          errors.push(`File ${i + 1}: WebP conversion failed - result is not a Buffer`);
          continue;
        }

        if (webpBuffer.length === 0) {
          errors.push(`File ${i + 1}: WebP conversion failed - result buffer is empty`);
          continue;
        }

        console.log(`File ${i + 1} WebP conversion successful:`, {
          originalSize: buffer.length,
          webpSize: webpBuffer.length,
          compressionRatio: ((buffer.length - webpBuffer.length) / buffer.length * 100).toFixed(1) + '%'
        });

        // Generate safe random filename with .webp extension
        const randomId = randomUUID();
        const safeFileName = `portfolio_${Date.now()}_${randomId}.webp`;

        console.log(`File ${i + 1} uploading to Vercel Blob:`, {
          filename: safeFileName,
          bufferSize: webpBuffer.length,
          isBuffer: Buffer.isBuffer(webpBuffer)
        });

        // Upload to Vercel Blob with explicit options
        const { url } = await put(safeFileName, webpBuffer, {
          contentType: 'image/webp',
          access: 'public',
        });

        console.log(`File ${i + 1} upload successful:`, { url });

        // Store in database
        const tattooImage = await prisma.tattooImage.create({
          data: {
            imageUrl: url,
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for title
          },
        });

        uploadedImages.push({
          id: tattooImage.id,
          imageUrl: tattooImage.imageUrl,
        });

        console.log(`File ${i + 1} database record created:`, { id: tattooImage.id });

      } catch (fileError) {
        console.error(`Error processing file ${i + 1}:`, fileError);
        errors.push(`File ${i + 1}: Upload failed - ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
      }
    }

    console.log('Upload processing complete:', {
      totalFiles: files.length,
      successful: uploadedImages.length,
      errors: errors.length
    });

    // Return response based on results
    if (uploadedImages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files were uploaded successfully',
        errors,
      }, { status: 400 });
    }

    if (errors.length > 0) {
      // Partial success
      return NextResponse.json({
        success: true,
        uploaded: uploadedImages,
        errors,
        message: `${uploadedImages.length} file(s) uploaded successfully, ${errors.length} file(s) failed`,
      }, { status: 207 }); // 207 Multi-Status
    }

    // Full success
    return NextResponse.json({
      success: true,
      uploaded: uploadedImages,
    });

  } catch (error) {
    console.error('Portfolio upload error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'An error occurred while processing the upload' 
      },
      { status: 500 }
    );
  }
} 