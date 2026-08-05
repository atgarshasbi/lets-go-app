const sgMail = require('@sendgrid/mail');

async function sendContactEmail({ subject, email, message }) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to: process.env.CONTACT_TO_EMAIL,
    from: process.env.SENDGRID_FROM_EMAIL,
    replyTo: email,
    subject: `[Let's Go! Contact] ${subject}`,
    text: `From: ${email}\n\n${message}`,
  });
}

module.exports = { sendContactEmail };
