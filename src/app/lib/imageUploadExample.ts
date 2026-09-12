import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToBlob, uploadImageToBlobWithCustomName, isValidImage } from './imageUpload';

/**
 * Example API route for handling image uploads
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate the image
    const isValid = await isValidImage(buffer);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
    }

    // Upload with random filename
    const result = await uploadImageToBlob(buffer);

    return NextResponse.json({
      success: true,
      url: result.url,
      pathname: result.pathname
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

/**
 * Example with custom filename
 */
export async function uploadWithCustomName(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const customName = formData.get('customName') as string;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate the image
    const isValid = await isValidImage(buffer);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
    }

    // Upload with custom filename
    const result = await uploadImageToBlobWithCustomName(buffer, customName || file.name);

    return NextResponse.json({
      success: true,
      url: result.url,
      pathname: result.pathname
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 