# Complete Image Upload, Downscaling & WebP Conversion Demo

This is a comprehensive demo of the image processing system found in your project. It includes client-side compression, server-side WebP conversion, and Vercel Blob storage.

## 📦 Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "@vercel/blob": "^1.1.1",
    "browser-image-compression": "^2.0.2",
    "sharp": "^0.34.3"
  }
}
```

## 🚀 Installation

```bash
npm install @vercel/blob browser-image-compression sharp
```

## 📁 File Structure

```
src/
├── lib/
│   ├── imageUpload.ts          # Server-side utilities
│   ├── clientImageUpload.ts    # Client-side utilities
│   └── imageUtils.ts           # Shared utilities
├── api/
│   └── upload/
│       └── route.ts            # Upload API endpoint
└── components/
    └── ImageUploader.tsx       # React component
```

---

## 🔧 Core Files

### 1. Server-side Image Processing (`src/lib/imageUpload.ts`)

```typescript
import { put } from '@vercel/blob';
import sharp from 'sharp';
import crypto from 'crypto';

export interface UploadResult {
  url: string;
  pathname: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

/**
 * Uploads an image buffer to Vercel Blob with WebP conversion and optional resizing
 */
export async function uploadImageToBlob(
  inputBuffer: Buffer,
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    customFileName?: string;
  } = {}
): Promise<UploadResult> {
  try {
    // Validate input
    if (!Buffer.isBuffer(inputBuffer) || inputBuffer.length === 0) {
      throw new Error('Invalid input buffer');
    }

    const { quality = 80, maxWidth, maxHeight, customFileName } = options;

    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();
    
    // Create Sharp instance with WebP conversion
    let sharpInstance = sharp(inputBuffer).webp({ quality });

    // Apply resizing if specified
    if (maxWidth || maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to WebP buffer
    const webpBuffer = await sharpInstance.toBuffer();

    // Generate filename
    const filename = customFileName 
      ? sanitizeFileName(customFileName) + '.webp'
      : generateRandomFileName();

    // Upload to Vercel Blob
    const uploaded = await put(filename, webpBuffer, {
      contentType: 'image/webp',
      access: 'public',
    });

    // Get final metadata
    const finalMetadata = await sharp(webpBuffer).metadata();

    return {
      url: uploaded.url,
      pathname: uploaded.pathname,
      metadata: {
        width: finalMetadata.width || 0,
        height: finalMetadata.height || 0,
        size: webpBuffer.length,
        format: 'webp'
      }
    };

  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uploads multiple images with batch processing
 */
export async function uploadMultipleImages(
  buffers: Buffer[],
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    prefix?: string;
  } = {}
): Promise<UploadResult[]> {
  const { prefix = 'batch' } = options;
  const results: UploadResult[] = [];
  const errors: string[] = [];

  for (let i = 0; i < buffers.length; i++) {
    try {
      const result = await uploadImageToBlob(buffers[i], {
        ...options,
        customFileName: `${prefix}_${i + 1}_${Date.now()}`
      });
      results.push(result);
    } catch (error) {
      errors.push(`Image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (results.length === 0) {
    throw new Error(`All uploads failed: ${errors.join(', ')}`);
  }

  if (errors.length > 0) {
    console.warn('Some uploads failed:', errors);
  }

  return results;
}

/**
 * Validates if a buffer contains a valid image
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
  try {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) return false;
    const metadata = await sharp(buffer).metadata();
    return metadata.width !== undefined && metadata.height !== undefined;
  } catch {
    return false;
  }
}

/**
 * Gets image metadata
 */
export async function getImageMetadata(buffer: Buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a valid Buffer');
  }
  return await sharp(buffer).metadata();
}

// Helper functions
function generateRandomFileName(): string {
  const randomId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `image_${timestamp}_${randomId}.webp`;
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.[^/.]+$/, '')
    .substring(0, 100);
}
```

### 2. Client-side Image Processing (`src/lib/clientImageUpload.ts`)

```typescript
import imageCompression from 'browser-image-compression';

export interface ClientUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: string;
  };
}

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  useWebWorker?: boolean;
}

/**
 * Compresses an image file on the client side
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 2,
    maxWidthOrHeight = 2000,
    quality = 0.8,
    useWebWorker = true
  } = options;

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      fileType: 'image/webp',
      useWebWorker,
      initialQuality: quality,
    });

    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error(`Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uploads a file to the server with client-side compression
 */
export async function uploadImageToServer(
  file: File,
  endpoint: string = '/api/upload',
  compressionOptions?: CompressionOptions
): Promise<ClientUploadResult> {
  try {
    console.log('Starting upload process:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Validate file
    if (!file || file.size === 0) {
      return { success: false, error: 'Invalid file' };
    }

    // Check file type
    const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      return { 
        success: false, 
        error: `Invalid file type. Allowed: ${validTypes.join(', ')}` 
      };
    }

    // Compress image
    const compressedFile = await compressImage(file, compressionOptions);
    
    const metadata = {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1) + '%'
    };

    console.log('Compression completed:', metadata);

    // Upload to server
    const formData = new FormData();
    formData.append('files', compressedFile, generateSafeFileName(file.name));

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
      url: uploadedUrl,
      metadata
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Validates if a file is a valid image
 */
export function isValidImageFile(file: File): boolean {
  if (!file) return false;
  const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
  return validTypes.includes(file.type);
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function
function generateSafeFileName(originalName: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const safeName = baseName
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
  
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `client_${safeName}_${timestamp}_${randomSuffix}.webp`;
}
```

### 3. Upload API Endpoint (`src/app/api/upload/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
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

    // Process each file
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

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert image to WebP using sharp
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 80 })
          .toBuffer();

        // Generate safe random filename
        const randomId = randomUUID();
        const safeFileName = `upload_${Date.now()}_${randomId}.webp`;

        // Upload to Vercel Blob
        const { url } = await put(safeFileName, webpBuffer, {
          contentType: 'image/webp',
          access: 'public',
        });

        uploadedImages.push({
          id: randomId,
          imageUrl: url,
        });

        console.log(`File ${i + 1} uploaded successfully:`, { url });

      } catch (fileError) {
        console.error(`Error processing file ${i + 1}:`, fileError);
        errors.push(`File ${i + 1}: Upload failed - ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
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
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'An error occurred while processing the upload' 
      },
      { status: 500 }
    );
  }
}
```

### 4. React Upload Component (`src/components/ImageUploader.tsx`)

```typescript
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { uploadImageToServer, isValidImageFile, formatFileSize } from '@/lib/clientImageUpload';

interface ImageUploaderProps {
  onUploadSuccess?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  endpoint?: string;
  className?: string;
}

interface SelectedFile {
  file: File;
  id: string;
  preview?: string;
}

export default function ImageUploader({
  onUploadSuccess,
  onUploadError,
  maxFiles = 10,
  endpoint = '/api/upload',
  className = ''
}: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => isValidImageFile(file));
    
    if (validFiles.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: SelectedFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: URL.createObjectURL(file)
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [maxFiles, onUploadError]);

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const selectedFile of selectedFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [selectedFile.id]: 0 }));
        
        const result = await uploadImageToServer(selectedFile.file, endpoint);
        
        if (result.success && result.url) {
          uploadedUrls.push(result.url);
          setUploadProgress(prev => ({ ...prev, [selectedFile.id]: 100 }));
        } else {
          errors.push(`${selectedFile.file.name}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`${selectedFile.file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
      }
    }

    setIsUploading(false);
    setUploadProgress({});

    if (uploadedUrls.length > 0) {
      onUploadSuccess?.(uploadedUrls);
      setSelectedFiles([]);
    }

    if (errors.length > 0) {
      onUploadError?.(errors.join(', '));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
      >
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-gray-600">Drag and drop images here, or</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            browse files
          </button>
          <p className="text-sm text-gray-500">
            Supports: WebP, JPEG, PNG, HEIC, HEIF (max {maxFiles} files, 10MB each)
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Selected Files ({selectedFiles.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFiles.map((selectedFile) => (
              <div key={selectedFile.id} className="border rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  {selectedFile.preview && (
                    <img
                      src={selectedFile.preview}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.file.size)}
                    </p>
                    {uploadProgress[selectedFile.id] !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[selectedFile.id]}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(selectedFile.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={isUploading}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
        </button>
      )}
    </div>
  );
}
```

### 5. Next.js Configuration (`next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

export default nextConfig
```

---

## 🎯 Usage Examples

### Basic Upload
```typescript
import { ImageUploader } from '@/components/ImageUploader';

function MyPage() {
  const handleUploadSuccess = (urls: string[]) => {
    console.log('Uploaded URLs:', urls);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <ImageUploader
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
      maxFiles={5}
    />
  );
}
```

### Server-side Processing
```typescript
import { uploadImageToBlob } from '@/lib/imageUpload';

// Upload with custom options
const result = await uploadImageToBlob(imageBuffer, {
  quality: 90,
  maxWidth: 1920,
  maxHeight: 1080,
  customFileName: 'my-image'
});

console.log('Uploaded:', result.url);
```

### Client-side Compression
```typescript
import { compressImage } from '@/lib/clientImageUpload';

const compressedFile = await compressImage(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1500,
  quality: 0.8
});
```

---

## 🔧 Environment Variables

Add to your `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

---

## ✨ Features Summary

- **🖼️ Multi-format support**: JPEG, PNG, HEIC, HEIF → WebP
- **📏 Smart resizing**: Configurable max dimensions
- **🗜️ Compression**: Client-side + server-side optimization
- **☁️ Cloud storage**: Vercel Blob integration
- **📱 Responsive UI**: Drag & drop interface
- **⚡ Batch upload**: Up to 10 files simultaneously
- **🛡️ Validation**: File type and size checking
- **📊 Progress tracking**: Real-time upload progress
- **🎨 Customizable**: Quality, dimensions, filenames

This demo provides a complete, production-ready image upload system that you can integrate into any Next.js project!

