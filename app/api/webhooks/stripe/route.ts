import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Beat from '@/models/Beat';
import { generateLicensePDF } from '@/lib/pdf-generator';
import { sendEmail } from '@/lib/brevo';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature found in request headers');
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    console.log('Webhook event received:', event.type);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await connectDB();
      const session = event.data.object;

      console.log('Processing checkout.session.completed for session:', session.id);

      const order = await Order.findOne({
        stripeSessionId: session.id,
      });

      if (!order) {
        console.error('Order not found for session:', session.id);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      console.log('Order found:', order._id);

      const beat = await Beat.findById(order.beatId);
      if (!beat) {
        console.error('Beat not found for order:', order.beatId);
        return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
      }

      console.log('Beat found:', beat.title);

      // Generate PDF license
      console.log('Generating PDF license...');
      const pdfBuffer = await generateLicensePDF(
        order,
        beat,
        order.customerName,
        order.customerEmail
      );

      // Convert PDF to base64 for email attachment
      const pdfBase64 = pdfBuffer.toString('base64');

      // Update order
      order.status = 'completed';
      order.stripePaymentIntentId = session.payment_intent as string;
      order.filesDelivered = true;
      await order.save();

      console.log('Order updated to completed');

      // Only mark beat as sold if it's an exclusive license
      if (order.licenseType === 'Exclusive') {
        beat.isSold = true;
        await beat.save();
        console.log('Beat marked as sold (Exclusive license)');
      }

      // Prepare file download links
      const files = [];
      if (beat.mp3Url) files.push({ name: 'MP3', url: beat.mp3Url });
      if (beat.wavUrl) files.push({ name: 'WAV', url: beat.wavUrl });
      if (beat.trackoutsUrl) files.push({ name: 'Trackouts', url: beat.trackoutsUrl });

      // Send email with files and license
      console.log('Preparing email to:', order.customerEmail);
      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Thank you for your purchase!</h2>
            <p>Dear ${order.customerName},</p>
            <p>Your purchase of "<strong>${beat.title}</strong>" has been completed successfully.</p>
            
            <h3>License Type: ${order.licenseType}</h3>
            
            <h3>Download Your Files:</h3>
            <ul>
              ${files.map((file) => `<li><a href="${file.url}" style="color: #0066cc;">${file.name}</a></li>`).join('')}
            </ul>
            
            <h3>License Agreement:</h3>
            <p>Your license agreement PDF has been attached to this email.</p>
            
            <p>Thank you for choosing YCSYH!</p>
            <p>Best regards,<br>YCSYH Publishing</p>
          </body>
        </html>
      `;

      console.log('Sending email...');
      await sendEmail(
        order.customerEmail,
        `Your Purchase: ${beat.title} - YCSYH`,
        emailHtml,
        [
          {
            name: `license-${order._id}.pdf`,
            content: pdfBase64,
          },
        ]
      );
      console.log('Email sent successfully to:', order.customerEmail);
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      // Don't return error to Stripe, just log it
      // Stripe will retry if we return an error
    }
  }

  return NextResponse.json({ received: true });
}

