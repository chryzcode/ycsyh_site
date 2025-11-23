import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Beat from '@/models/Beat';
import { generateLicensePDF } from '@/lib/pdf-generator';
import { sendEmail } from '@/lib/brevo';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    await connectDB();
    const session = event.data.object;

    const order = await Order.findOne({
      stripeSessionId: session.id,
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const beat = await Beat.findById(order.beatId);
    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

    // Generate PDF license
    const pdfBuffer = await generateLicensePDF(
      order,
      beat,
      order.customerName,
      order.customerEmail
    );

    // Upload PDF to Cloudinary
    const pdfBase64 = pdfBuffer.toString('base64');
    const pdfUpload = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${pdfBase64}`,
      {
        resource_type: 'raw',
        folder: 'licenses',
        public_id: `license-${order._id}`,
      }
    );

    // Update order
    order.status = 'completed';
    order.stripePaymentIntentId = session.payment_intent as string;
    order.licensePdfUrl = pdfUpload.secure_url;
    order.filesDelivered = true;
    await order.save();

    // Mark beat as sold
    beat.isSold = true;
    await beat.save();

    // Prepare file download links
    const files = [];
    if (beat.mp3Url) files.push({ name: 'MP3', url: beat.mp3Url });
    if (beat.wavUrl) files.push({ name: 'WAV', url: beat.wavUrl });
    if (beat.trackoutsUrl) files.push({ name: 'Trackouts', url: beat.trackoutsUrl });

    // Send email with files and license
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Thank you for your purchase!</h2>
          <p>Dear ${order.customerName},</p>
          <p>Your purchase of "<strong>${beat.title}</strong>" has been completed successfully.</p>
          
          <h3>Download Your Files:</h3>
          <ul>
            ${files.map((file) => `<li><a href="${file.url}">${file.name}</a></li>`).join('')}
          </ul>
          
          <h3>License Agreement:</h3>
          <p><a href="${pdfUpload.secure_url}">Download License PDF</a></p>
          
          <p>Thank you for choosing YCSYH!</p>
          <p>Best regards,<br>YCSYH Publishing</p>
        </body>
      </html>
    `;

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
  }

  return NextResponse.json({ received: true });
}

