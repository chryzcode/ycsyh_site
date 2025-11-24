import * as SibApiV3Sdk from '@sendinblue/client';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: Array<{ name: string; content: string }>
) => {
  // Check if Brevo API key is configured
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured in environment variables');
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    throw new Error('BREVO_SENDER_EMAIL is not configured in environment variables');
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: 'YCSYH',
    email: process.env.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ email: to }];

  if (attachments && attachments.length > 0) {
    sendSmtpEmail.attachment = attachments.map((att) => ({
      name: att.name,
      content: att.content,
    }));
    console.log(`Attaching ${attachments.length} file(s) to email`);
  }

  try {
    console.log('📧 Sending email via Brevo...');
    console.log('   To:', to);
    console.log('   Subject:', subject);
    console.log('   Sender:', sendSmtpEmail.sender.email);
    console.log('   Has attachments:', attachments ? attachments.length > 0 : false);
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    // Access messageId from the response body (Brevo SDK structure)
    const messageId = (result as any).body?.messageId || (result as any).response?.body?.messageId;
    console.log('✅ Email sent successfully! Message ID:', messageId);
    return result;
  } catch (error: any) {
    console.error('❌ Error sending email via Brevo:');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    if (error.response) {
      console.error('   Response status:', error.response.statusCode);
      console.error('   Response body:', JSON.stringify(error.response.body, null, 2));
    }
    throw error;
  }
};
