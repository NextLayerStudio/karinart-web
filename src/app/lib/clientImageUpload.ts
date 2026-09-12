import imageCompression from 'browser-image-compression';
// import { put } from '@vercel/blob';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Compresses and uploads an image file to Vercel Blob
 * @param file - The image file to upload
 * @param endpoint - The upload endpoint to use (defaults to portfolio upload)
 * @returns Promise<UploadResult> - Result with success status, URL, or error
 */
export async function uploadImageToBlob(file: File, endpoint: string = '/api/portfolio/upload'): Promise<UploadResult> {
  try {
    console.log('Starting image upload process:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      endpoint
    });

    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (!(file instanceof File)) {
      return { success: false, error: 'Invalid file object' };
    }

    if (file.size === 0) {
      return { success: false, error: 'File is empty' };
    }

    // Check file type
    const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      return { 
        success: false, 
        error: `Invalid file type (${file.type}). Only WebP, JPEG, JPG, PNG, HEIC, and HEIF are allowed` 
      };
    }

    console.log('File validation passed, compressing image...');

    // Compress image using browser-image-compression
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 2000,
      fileType: 'image/webp',
      useWebWorker: true,
      signal: undefined, // No abort signal for now
    });

    console.log('Image compression completed:', {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1) + '%'
    });

    // Generate safe filename
    const safeFileName = generateSafeFileName(file.name);
    console.log('Generated safe filename:', safeFileName);

    // Upload to Vercel Blob using the server-side API
    console.log('Uploading to Vercel Blob via server API...');
    
    // Create FormData to send to our server API
    const formData = new FormData();
    formData.append('files', compressedFile, safeFileName);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.uploaded || result.uploaded.length === 0) {
      throw new Error(result.error || 'Upload failed');
    }

    const uploadedUrl = result.uploaded[0].imageUrl;
    console.log('Upload successful:', { url: uploadedUrl });

    return {
      success: true,
      url: uploadedUrl
    };

  } catch (error) {
    console.error('Image upload error:', error);
    
    let errorMessage = 'Upload failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Generates a safe filename by replacing unsafe characters
 * @param originalName - The original filename
 * @returns string - Safe filename ending in .webp
 */
function generateSafeFileName(originalName: string): string {
  // Remove extension and get base name
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  
  // Replace unsafe characters with underscores
  const safeName = baseName
    .replace(/[^a-zA-Z0-9\-_]/g, '_') // Replace non-alphanumeric chars with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase(); // Convert to lowercase
  
  // Add timestamp and random suffix for uniqueness
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `client_${safeName}_${timestamp}_${randomSuffix}.webp`;
}

/**
 * Validates if a file is a valid image
 * @param file - The file to validate
 * @returns boolean - True if valid image
 */
export function isValidImageFile(file: File): boolean {
  if (!file) return false;
  
  const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
  return validTypes.includes(file.type);
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns string - Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 