import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Beat from '@/models/Beat';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const beat = await Beat.findById(id).lean();
    
    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

    // If there's a dedicated preview file, redirect to it
    if (beat.previewUrl) {
      return NextResponse.redirect(beat.previewUrl);
    }

    // If no preview but MP3 exists, redirect to MP3
    // The client-side will enforce the 35-second limit
    if (!beat.mp3Url) {
      return NextResponse.json({ error: 'No preview or MP3 available' }, { status: 404 });
    }

    // Redirect to the MP3 file - client will limit to 35 seconds
    return NextResponse.redirect(beat.mp3Url);
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

