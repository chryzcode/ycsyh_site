import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Beat from '@/models/Beat';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    const { sessionId } = await params;
    
    const order = await Order.findOne({ stripeSessionId: sessionId }).populate('beatId');
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const beat = await Beat.findById(order.beatId);
    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        id: order._id,
        status: order.status,
        licenseType: order.licenseType,
        filesDelivered: order.filesDelivered,
        beat: {
          title: beat.title,
        },
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

