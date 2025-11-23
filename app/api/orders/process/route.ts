import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Beat from '@/models/Beat';
import { generateLicensePDF } from '@/lib/pdf-generator';
import { sendEmail } from '@/lib/brevo';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('Processing order for session:', sessionId);

    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findOne({ stripeSessionId: sessionId });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If already processed, return success
    if (order.status === 'completed' && order.filesDelivered) {
      return NextResponse.json({
        message: 'Order already processed',
        order: {
          id: order._id,
          status: order.status,
          filesDelivered: order.filesDelivered,
        },
      });
    }

    console.log('Order found:', order._id);

    const beat = await Beat.findById(order.beatId);
    if (!beat) {
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
    try {
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
      console.log('✅ Email sent successfully to:', order.customerEmail);
    } catch (emailError: any) {
      console.error('❌ Error sending email:', emailError);
      console.error('Email error details:', {
        message: emailError.message,
        response: emailError.response?.body,
        status: emailError.response?.statusCode,
      });
      // Don't fail the entire request if email fails
      // Order is already processed, email can be resent later
    }

    return NextResponse.json({
      message: 'Order processed successfully',
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
    console.error('❌ Error processing order:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process order',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

