const SUBJECT_MAX = 100;
const MESSAGE_MAX = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact({ subject, email, message }) {
  if (!subject || !email || !message) {
    return { valid: false, error: 'subject, email, and message are required' };
  }
  if (subject.length > SUBJECT_MAX) {
    return { valid: false, error: `Subject must be ${SUBJECT_MAX} characters or fewer` };
  }
  if (message.length > MESSAGE_MAX) {
    return { valid: false, error: `Message must be ${MESSAGE_MAX} characters or fewer` };
  }
  if (!EMAIL_RE.test(email)) {
    return { valid: false, error: 'Invalid email address' };
  }
  return { valid: true };
}

module.exports = { validateContact, SUBJECT_MAX, MESSAGE_MAX };
