import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Beat from '@/models/Beat';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const beat = await Beat.findById(params.id);
    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }
    return NextResponse.json({ beat }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch beat' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const body = await request.json();
    const beat = await Beat.findByIdAndUpdate(params.id, body, { new: true });
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
  { params }: { params: { id: string } }
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
    const beat = await Beat.findByIdAndDelete(params.id);
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
