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
  // other email provider. Bake name + message into the thrown message
  // itself (not a nested property) since log viewers don't reliably
  // expand nested error objects - we learned this the hard way with
  // SendGrid's response.body showing as "[Array]" in Azure Log Stream.
  if (error) {
    throw new Error(`Resend send failed: [${error.name || 'unknown'}] ${error.message || 'no message'}`);
  }
}

module.exports = { sendContactEmail };
