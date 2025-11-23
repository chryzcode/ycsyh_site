import PDFDocument from 'pdfkit';
import { IBeat } from '@/models/Beat';
import { IOrder } from '@/models/Order';
import { licenseTerms } from './license-terms';

export const generateLicensePDF = async (
  order: IOrder,
  beat: IBeat,
  customerName: string,
  customerEmail: string
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    const terms = licenseTerms[order.licenseType];

    // Header
    doc.fontSize(20).text('HEARD MUSIC / YCSYH LICENSE AGREEMENT', { align: 'center' });
    doc.moveDown();

    // License Details
    doc.fontSize(12);
    doc.text(`License Type: ${order.licenseType}`, { align: 'left' });
    doc.text(`Price: £${order.amount}`, { align: 'left' });
    doc.moveDown();
    doc.text(`Beat Title: ${beat.title}`, { align: 'left' });
    doc.text(`Producer: ${beat.producer}`, { align: 'left' });
    doc.text(`Publisher: YOU CAN SAY YOU HEARD (YCSYH)`, { align: 'left' });
    doc.text(`BPM: ${beat.bpm}`, { align: 'left' });
    doc.text(`Key: ${beat.key}`, { align: 'left' });
    doc.moveDown();

    // Customer Information
    doc.text('Licensee Information:', { underline: true });
    doc.text(`Name: ${customerName}`);
    doc.text(`Email: ${customerEmail}`);
    doc.moveDown();

    // Rights Granted
    doc.text('Rights Granted:', { underline: true });
    doc.fontSize(10);
    terms.rights.forEach((right, index) => {
      doc.text(`${index + 1}. ${right}`, { indent: 20 });
    });
    doc.moveDown();

    // Restrictions
    if (terms.restrictions.length > 0) {
      doc.fontSize(12);
      doc.text('Restrictions:', { underline: true });
      doc.fontSize(10);
      terms.restrictions.forEach((restriction, index) => {
        doc.text(`${index + 1}. ${restriction}`, { indent: 20 });
      });
      doc.moveDown();
    }

    // Publishing Split
    doc.fontSize(12);
    doc.text('Publishing Split:', { underline: true });
    doc.fontSize(10);
    doc.text(terms.publishing, { indent: 20 });
    doc.moveDown();

    // Credit Requirement
    doc.fontSize(12);
    doc.text('Credit Requirement:', { underline: true });
    doc.fontSize(10);
    doc.text(terms.credit, { indent: 20 });
    doc.moveDown();

    // Ownership
    doc.fontSize(12);
    doc.text('Ownership:', { underline: true });
    doc.fontSize(10);
    if (order.licenseType === 'Exclusive') {
      doc.text('Buyer owns 100% master of the new song.', { indent: 20 });
      doc.text('Heard Music (YCSYH) retains publishing rights as specified above.', { indent: 20 });
    } else {
      doc.text('Heard Music retains full ownership of the beat.', { indent: 20 });
      doc.text('Buyer receives usage rights only as specified in this agreement.', { indent: 20 });
    }
    doc.moveDown();

    // General Terms
    doc.fontSize(12);
    doc.text('General Terms:', { underline: true });
    doc.fontSize(10);
    doc.text('1. This license is non-transferable and applies only to the original purchaser.', { indent: 20 });
    doc.text('2. The licensee may not resell, lease, or transfer this license to any third party.', { indent: 20 });
    doc.text('3. Compositions must be registered with PRS only when songs are released.', { indent: 20 });
    doc.text('4. All uses must include proper credit as specified above.', { indent: 20 });
    if (order.licenseType !== 'Exclusive') {
      doc.text('5. This is a non-exclusive license. The beat may be licensed to other artists.', { indent: 20 });
    }
    doc.moveDown();

    // Date and Signature
    doc.fontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'left' });
    doc.text(`Order ID: ${order._id.toString()}`, { align: 'left' });
    doc.moveDown(2);
    doc.text('YOU CAN SAY YOU HEARD (YCSYH)', { align: 'right' });
    doc.text('Heard Music', { align: 'right' });

    doc.end();
  });
};

