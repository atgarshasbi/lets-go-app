const { app } = require('@azure/functions');
const { validateContact } = require('../contactValidation');
const { sendContactEmail } = require('../sendgrid');

app.http('contact', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'contact',
  handler: async (request, context) => {
    let body;
    try {
      body = await request.json();
    } catch {
      return { status: 400, jsonBody: { error: 'Invalid JSON body' } };
    }

    const { subject, email, message, hp } = body || {};

    // Honeypot: real users never fill this hidden field. Pretend success so bots don't retry.
    if (hp) {
      return { status: 200, jsonBody: { status: 'sent' } };
    }

    const result = validateContact({ subject, email, message });
    if (!result.valid) {
      return { status: 400, jsonBody: { error: result.error } };
    }

    try {
      await sendContactEmail({ subject, email, message });
      return { status: 200, jsonBody: { status: 'sent' } };
    } catch (err) {
      context.error('Failed to send contact email', err);
      return { status: 502, jsonBody: { error: 'Could not send message right now' } };
    }
  },
});
