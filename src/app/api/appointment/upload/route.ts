import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

interface UploadedImage {
  id: string;
  imageUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 1) {
      return NextResponse.json({ error: 'Only one file allowed per upload' }, { status: 400 });
    }

    const file = files[0];
    const uploadedImages: UploadedImage[] = [];

    try {
      // Validate file
      if (!file || file.size === 0) {
        return NextResponse.json({ error: 'Empty or invalid file' }, { status: 400 });
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

      // Generate random filename with proper extension
      const fileExtension = file.type === 'image/webp' ? 'webp' : file.name.split('.').pop() || 'webp';
      const randomFilename = `appointment-${randomUUID()}.${fileExtension}`;

      // Upload to Vercel Blob
      const { url } = await put(randomFilename, file, {
        access: 'public',
      });

      uploadedImages.push({
        id: randomUUID(),
        imageUrl: url,
      });

    } catch (fileError) {
      console.error('Error processing file:', fileError);
      return NextResponse.json({ 
        error: `Upload failed - ${fileError instanceof Error ? fileError.message : 'Unknown error'}` 
      }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      uploaded: uploadedImages,
    });

  } catch (error) {
    console.error('Appointment upload error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'An error occurred while processing the upload' 
      },
      { status: 500 }
    );
  }
} 