import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Beat from '@/models/Beat';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const sold = searchParams.get('sold');

    const query: any = {};
    if (category) {
      query.category = category;
    }
    if (sold === 'false' || sold === null) {
      query.isSold = false;
    }

    const beats = await Beat.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ beats }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching beats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch beats',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
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
    await connectDB();
    const body = await request.json();
    const beat = await Beat.create(body);
    return NextResponse.json({ beat }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create beat' },
      { status: 500 }
    );
  }
}
