import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Beat from '@/models/Beat';
import { requireAdmin } from '@/lib/auth';

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
    
    // Remove file URLs from response - users shouldn't access files without paying
    // Also remove exclusivePrice if it's 0 or not set
    const { mp3Url, wavUrl, trackoutsUrl, ...beatWithoutFiles } = beat as any;
    
    // Remove exclusivePrice if it's 0 or undefined
    if (!beatWithoutFiles.exclusivePrice || beatWithoutFiles.exclusivePrice === 0) {
      delete beatWithoutFiles.exclusivePrice;
    }
    
    return NextResponse.json({ beat: beatWithoutFiles }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch beat' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if ('error' in adminCheck) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const beat = await Beat.findByIdAndUpdate(id, body, { new: true });
    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }
    return NextResponse.json({ beat }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update beat' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if ('error' in adminCheck) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  try {
    await connectDB();
    const { id } = await params;
    const beat = await Beat.findByIdAndDelete(id);
    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Beat deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete beat' },
      { status: 500 }
    );
  }
}
