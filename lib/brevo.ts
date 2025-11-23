import * as SibApiV3Sdk from '@sendinblue/client';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: Array<{ name: string; content: string }>
) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: 'YCSYH',
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@ycsyh.com',
  };
  sendSmtpEmail.to = [{ email: to }];

  if (attachments) {
    sendSmtpEmail.attachment = attachments.map((att) => ({
      name: att.name,
      content: att.content,
    }));
  }

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
