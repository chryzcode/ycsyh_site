import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Beat from '@/models/Beat';
import Order from '@/models/Order';
import { stripe } from '@/lib/stripe';

import { licenseTerms } from '@/lib/license-terms';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { beatId, customerName, customerEmail, licenseType } = await request.json();

    if (!licenseType || !['MP3 Lease', 'WAV Lease', 'Trackout Lease', 'Exclusive'].includes(licenseType)) {
      return NextResponse.json(
        { error: 'Valid license type is required' },
        { status: 400 }
      );
    }

    const beat = await Beat.findById(beatId);
    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

    if (beat.isSold && licenseType !== 'Exclusive') {
      return NextResponse.json(
        { error: 'This beat is already sold' },
        { status: 400 }
      );
    }

    // Get price based on license type
    let price = 0;
    if (licenseType === 'MP3 Lease') price = beat.mp3Price;
    else if (licenseType === 'WAV Lease') price = beat.wavPrice;
    else if (licenseType === 'Trackout Lease') price = beat.trackoutPrice;
    else if (licenseType === 'Exclusive') {
      if (!beat.exclusivePrice) {
        return NextResponse.json(
          { error: 'Exclusive license not available. Please contact for pricing.' },
          { status: 400 }
        );
      }
      price = beat.exclusivePrice;
    }

    if (price === 0) {
      return NextResponse.json(
        { error: 'Invalid price for selected license type' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${beat.title} - ${licenseType}`,
              description: `${beat.category} - ${beat.bpm} BPM - Key: ${beat.key}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/beats/${beatId}`,
      customer_email: customerEmail,
      metadata: {
        beatId: beatId.toString(),
        customerName,
        customerEmail,
        licenseType,
      },
    });

    // Create order record
    await Order.create({
      beatId,
      customerEmail,
      customerName,
      stripeSessionId: session.id,
      amount: price,
      licenseType,
      status: 'pending',
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

