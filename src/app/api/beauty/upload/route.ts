import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

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
        // Validate file
        if (!file || file.size === 0) {
          errors.push(`File ${i + 1}: Empty or invalid file`);
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
        // Generate random filename with original extension
        const fileExtension = file.type === 'image/webp' ? 'webp' : file.name.split('.').pop() || 'webp';
        const randomFilename = `${randomUUID()}.${fileExtension}`;
        // Upload to Vercel Blob
        const { url } = await put(randomFilename, file, {
          access: 'public',
        });
        // Store in database
        const beautyImage = await prisma.beautyImage.create({
          data: {
            imageUrl: url,
            title: file.name.replace(/\.[^/.]+$/, ''),
          },
        });
        uploadedImages.push({
          id: beautyImage.id,
          imageUrl: beautyImage.imageUrl,
        });
      } catch (fileError) {
        console.error(`Error processing file ${i + 1}:`, fileError);
        errors.push(`File ${i + 1}: Upload failed - ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
      }
    }
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
    console.error('Beauty upload error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'An error occurred while processing the upload' 
      },
      { status: 500 }
    );
  }
} 