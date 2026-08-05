import { describe, it, expect } from 'vitest';
import { validateContact, SUBJECT_MAX, MESSAGE_MAX } from '../src/contactValidation.js';

const valid = { subject: 'Bug report', email: 'parent@example.com', message: 'Something broke.' };

describe('validateContact', () => {
  it('accepts a well-formed submission', () => {
    expect(validateContact(valid)).toEqual({ valid: true });
  });

  it('rejects a missing subject', () => {
    const result = validateContact({ ...valid, subject: '' });
    expect(result.valid).toBe(false);
  });

  it('rejects a missing email', () => {
    const result = validateContact({ ...valid, email: '' });
    expect(result.valid).toBe(false);
  });

  it('rejects a missing message', () => {
    const result = validateContact({ ...valid, message: '' });
    expect(result.valid).toBe(false);
  });

  it('rejects an invalid email address', () => {
    const result = validateContact({ ...valid, email: 'not-an-email' });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/email/i);
  });

  it('rejects a subject over the max length', () => {
    const result = validateContact({ ...valid, subject: 'x'.repeat(SUBJECT_MAX + 1) });
    expect(result.valid).toBe(false);
  });

  it('rejects a message over the max length', () => {
    const result = validateContact({ ...valid, message: 'x'.repeat(MESSAGE_MAX + 1) });
    expect(result.valid).toBe(false);
  });

  it('accepts subject/message exactly at the max length', () => {
    const result = validateContact({
      ...valid,
      subject: 'x'.repeat(SUBJECT_MAX),
      message: 'x'.repeat(MESSAGE_MAX),
    });
    expect(result.valid).toBe(true);
  });
});
