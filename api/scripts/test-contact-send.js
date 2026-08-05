// Manual local test — not part of the deployed Function, not run by CI.
// Sends one real email via SendGrid using env vars from your own shell.
const { sendContactEmail } = require('../src/sendgrid');

async function main() {
  const required = ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL', 'CONTACT_TO_EMAIL'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('Missing env vars:', missing.join(', '));
    process.exit(1);
  }

  await sendContactEmail({
    subject: 'Local test message',
    email: 'test-reply-to@example.com',
    message: 'This is a local test of the contact form pipeline — if you got this, SendGrid is wired up correctly.',
  });

  console.log('Sent! Check the inbox for CONTACT_TO_EMAIL.');
}

main().catch(err => {
  console.error('Failed:', err.response?.body || err.message || err);
  process.exit(1);
});
