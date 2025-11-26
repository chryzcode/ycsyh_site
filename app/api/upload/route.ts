import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/auth';

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB for images
  audio: 100 * 1024 * 1024, // 100MB for audio files
  zip: 200 * 1024 * 1024, // 200MB for ZIP files
  default: 100 * 1024 * 1024, // 100MB default
};

function getMaxFileSize(fileType: string): number {
  if (fileType.startsWith('image/')) return MAX_FILE_SIZES.image;
  if (fileType.startsWith('audio/')) return MAX_FILE_SIZES.audio;
  if (fileType.includes('zip') || fileType.includes('application/zip')) return MAX_FILE_SIZES.zip;
  return MAX_FILE_SIZES.default;
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if ('error' in adminCheck) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    const maxSize = getMaxFileSize(file.type);
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Determine resource type and folder based on file type
    let resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto';
    let folder = 'beats';
    let uploadOptions: any = {
      folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    if (file.type.startsWith('image/')) {
      resourceType = 'image';
      folder = 'beats/images';
      // Optimize images for faster delivery
      uploadOptions.eager = [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        { width: 400, height: 400, crop: 'limit', quality: 'auto' },
      ];
      uploadOptions.eager_async = true;
    } else if (file.type.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary treats audio as video
      folder = 'beats/audio';
    } else if (file.type.includes('zip') || file.type.includes('application/zip')) {
      resourceType = 'raw';
      folder = 'beats/trackouts';
    }

    uploadOptions.folder = folder;

    // Use streaming upload for better memory efficiency
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with optimized settings
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          ...uploadOptions,
          resource_type: resourceType,
          chunk_size: 6000000, // 6MB chunks for faster uploads
          timeout: 60000, // 60 second timeout
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Handle upload stream errors
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(error);
      });

      uploadStream.end(buffer);
    });

    const uploadResult = result as any;
    
    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload file';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.http_code) {
      errorMessage = `Upload failed: ${error.message || 'Unknown error'}`;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: error.http_code || 500 }
    );
  }
}

