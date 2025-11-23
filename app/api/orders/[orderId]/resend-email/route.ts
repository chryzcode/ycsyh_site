import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Beat from '@/models/Beat';
import { generateLicensePDF } from '@/lib/pdf-generator';
import { sendEmail } from '@/lib/brevo';
import { requireAdmin } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
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
    const { orderId } = await params;

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const beat = await Beat.findById(order.beatId);
    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

    // Generate PDF license for email attachment
    const pdfBuffer = await generateLicensePDF(
      order,
      beat,
      order.customerName,
      order.customerEmail
    );

    const pdfBase64 = pdfBuffer.toString('base64');

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

    order.filesDelivered = true;
    await order.save();

    return NextResponse.json({ 
      message: 'Email sent successfully',
      orderId: order._id,
      email: order.customerEmail 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error resending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend email' },
      { status: 500 }
    );
  }
}

