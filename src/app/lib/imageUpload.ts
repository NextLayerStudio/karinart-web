import { put } from '@vercel/blob';
import sharp, { type Metadata } from 'sharp';
import crypto from 'crypto';

/**
 * Uploads an image buffer to Vercel Blob with WebP conversion
 * @param inputBuffer - The input image buffer
 * @returns Promise<{ url: string, pathname: string }> - The uploaded file URL and pathname
 */
export async function uploadImageToBlob(
  inputBuffer: Buffer
): Promise<{ url: string; pathname: string }> {
  try {
    // Safety check: Ensure input is a valid Buffer
    if (!Buffer.isBuffer(inputBuffer)) {
      throw new Error('Input must be a valid Buffer');
    }

    if (inputBuffer.length === 0) {
      throw new Error('Input buffer is empty');
    }

    // Convert image to WebP with quality 80
    const webpBuffer = await sharp(inputBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    // Safety check: Ensure WebP conversion was successful
    if (!Buffer.isBuffer(webpBuffer) || webpBuffer.length === 0) {
      throw new Error('WebP conversion failed');
    }

    // Generate a random filename with safe characters
    const randomId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const safeFileName = `image_${timestamp}_${randomId}.webp`;

    // Upload to Vercel Blob with explicit options
    const uploaded = await put(safeFileName, webpBuffer, {
      contentType: 'image/webp',
      access: 'public',
    });

    return {
      url: uploaded.url,
      pathname: uploaded.pathname,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    throw new Error('Failed to upload image: Unknown error');
  }
}

/**
 * Uploads an image buffer to Vercel Blob with custom filename
 * @param inputBuffer - The input image buffer
 * @param customFileName - Custom filename (will be sanitized and converted to .webp)
 * @returns Promise<{ url: string, pathname: string }> - The uploaded file URL and pathname
 */
export async function uploadImageToBlobWithCustomName(
  inputBuffer: Buffer,
  customFileName: string
): Promise<{ url: string; pathname: string }> {
  try {
    // Safety check: Ensure input is a valid Buffer
    if (!Buffer.isBuffer(inputBuffer)) {
      throw new Error('Input must be a valid Buffer');
    }

    if (inputBuffer.length === 0) {
      throw new Error('Input buffer is empty');
    }

    // Convert image to WebP with quality 80
    const webpBuffer = await sharp(inputBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    // Safety check: Ensure WebP conversion was successful
    if (!Buffer.isBuffer(webpBuffer) || webpBuffer.length === 0) {
      throw new Error('WebP conversion failed');
    }

    // Sanitize filename and ensure .webp extension
    const sanitizedFileName = customFileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscore
      .replace(/\.[^/.]+$/, '') // Remove any existing extension
      .substring(0, 100); // Limit length to 100 characters
    
    const webpFileName = `${sanitizedFileName}.webp`;

    // Upload to Vercel Blob with explicit options
    const uploaded = await put(webpFileName, webpBuffer, {
      contentType: 'image/webp',
      access: 'public',
    });

    return {
      url: uploaded.url,
      pathname: uploaded.pathname,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    throw new Error('Failed to upload image: Unknown error');
  }
}

/**
 * Validates if a buffer contains a valid image
 * @param buffer - The buffer to validate
 * @returns Promise<boolean> - True if valid image, false otherwise
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
  try {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      return false;
    }

    // Try to get image metadata using sharp
    const metadata = await sharp(buffer).metadata();
    return metadata.width !== undefined && metadata.height !== undefined;
  } catch {
    return false;
  }
}

/**
 * Gets image metadata without processing
 * @param buffer - The image buffer
 * @returns Promise<Metadata> - Image metadata
 */
export async function getImageMetadata(buffer: Buffer): Promise<Metadata> {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a valid Buffer');
  }

  return await sharp(buffer).metadata();
} 