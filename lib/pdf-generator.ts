import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { IBeat } from '@/models/Beat';
import { IOrder } from '@/models/Order';
import { licenseTerms } from './license-terms';

export const generateLicensePDF = async (
  order: IOrder,
  beat: IBeat,
  customerName: string,
  customerEmail: string
): Promise<Buffer> => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size (8.5 x 11 inches)

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 750; // Start from top

    const write = (text: string, size: number = 12, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
      const currentFont = isBold ? fontBold : font;
      let x = 50; // Left margin
      
      if (align === 'center') {
        const textWidth = currentFont.widthOfTextAtSize(text, size);
        x = (612 - textWidth) / 2;
      } else if (align === 'right') {
        const textWidth = currentFont.widthOfTextAtSize(text, size);
        x = 562 - textWidth; // Right margin at 50
      }

      page.drawText(text, { 
        x, 
        y, 
        size, 
        font: currentFont,
        color: rgb(0, 0, 0),
      });

      y -= size + 6;
    };

    // Header
    write('HEARD MUSIC / YCSYH LICENSE AGREEMENT', 20, true, 'center');
    write('', 12);

    // License Details
    write(`License Type: ${order.licenseType}`, 12);
    write(`Price: £${order.amount}`, 12);
    write('', 12);
    write(`Beat Title: ${beat.title}`, 12);
    write(`Producer: ${beat.producer}`, 12);
    write(`Publisher: YOU CAN SAY YOU HEARD (YCSYH)`, 12);
    write(`BPM: ${beat.bpm}`, 12);
    write(`Key: ${beat.key}`, 12);
    write('', 12);

    // Customer Information
    write('Licensee Information:', 14, true);
    write(`Name: ${customerName}`, 12);
    write(`Email: ${customerEmail}`, 12);
    write('', 12);

    const terms = licenseTerms[order.licenseType];

    // Rights Granted
    write('Rights Granted:', 14, true);
    terms.rights.forEach((right, index) => {
      write(`${index + 1}. ${right}`, 10);
    });
    write('', 12);

    // Restrictions
    if (terms.restrictions && terms.restrictions.length > 0) {
      write('Restrictions:', 14, true);
      terms.restrictions.forEach((restriction, index) => {
        write(`${index + 1}. ${restriction}`, 10);
      });
      write('', 12);
    }

    // Publishing Split
    write('Publishing Split:', 14, true);
    write(terms.publishing, 10);
    write('', 12);

    // Credit Requirement
    write('Credit Requirement:', 14, true);
    write(terms.credit, 10);
    write('', 12);

    // Ownership
    write('Ownership:', 14, true);
    if (order.licenseType === 'Exclusive') {
      write('Buyer owns 100% master of the new song.', 10);
      write('Heard Music (YCSYH) retains publishing rights as specified above.', 10);
    } else {
      write('Heard Music retains full ownership of the beat.', 10);
      write('Buyer receives usage rights only as specified in this agreement.', 10);
    }
    write('', 12);

    // General Terms
    write('General Terms:', 14, true);
    write('1. This license is non-transferable and applies only to the original purchaser.', 10);
    write('2. The licensee may not resell, lease, or transfer this license to any third party.', 10);
    write('3. Compositions must be registered with PRS only when songs are released.', 10);
    write('4. All uses must include proper credit as specified above.', 10);
    if (order.licenseType !== 'Exclusive') {
      write('5. This is a non-exclusive license. The beat may be licensed to other artists.', 10);
    }
    write('', 12);

    // Date and Signature
    write(`Date: ${new Date().toLocaleDateString()}`, 12);
    write(`Order ID: ${order._id.toString()}`, 12);
    write('', 12);
    write('YOU CAN SAY YOU HEARD (YCSYH)', 12, false, 'right');
    write('Heard Music', 12, false, 'right');

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error creating PDF document:', error);
    throw error;
  }
};
