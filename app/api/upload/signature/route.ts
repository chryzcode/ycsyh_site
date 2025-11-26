import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/auth';

// Runtime configuration
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if ('error' in adminCheck) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  try {
    // Validate environment variables
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error('CLOUDINARY_API_SECRET is not configured');
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error('CLOUDINARY_API_KEY is not configured');
    }
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
    }

    const body = await request.json();
    const { folder, resourceType = 'auto' } = body;

    // Generate upload signature for client-side upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Build parameters object for signature
    // IMPORTANT: Do NOT include resource_type in signature (Cloudinary requirement)
    // Only include parameters that will be sent to Cloudinary
    // Parameters are automatically sorted by Cloudinary's api_sign_request
    const paramsToSign: Record<string, string | number> = {
      timestamp,
    };

    // Add folder if specified (always include if provided)
    if (folder && folder.trim()) {
      paramsToSign.folder = folder.trim();
    }

    // NOTE: resource_type is NOT included in signature per Cloudinary docs
    // It can be sent separately but should not be signed

    // Generate signature
    // Cloudinary's api_sign_request automatically sorts parameters alphabetically
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    // Log for debugging (remove in production if needed)
    console.log('Signature params:', JSON.stringify(paramsToSign));
    console.log('Generated signature:', signature);

    // Return signature and parameters
    const response: any = {
      signature,
      timestamp: timestamp.toString(), // Ensure it's a string
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    };

    // Include folder if it was in the signature
    if (paramsToSign.folder) {
      response.folder = String(paramsToSign.folder);
    }
    
    // Include resourceType separately (not in signature, but needed for upload)
    if (resourceType && resourceType !== 'auto') {
      response.resourceType = resourceType;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error generating upload signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature', details: error.message },
      { status: 500 }
    );
  }
}

