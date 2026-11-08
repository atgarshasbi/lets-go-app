const { Resend } = require('resend');

async function sendContactEmail({ subject, email, message }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: process.env.CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `[Let's Go! Contact] ${subject}`,
    text: `From: ${email}\n\n${message}`,
  });

  // The SDK reports failures via `error`, not by throwing — rethrow so
  // callers can keep using a plain try/catch like they would with any
  // other email provider.
  if (error) {
    throw new Error(error.message || 'Resend send failed');
  }
}

module.exports = { sendContactEmail };
