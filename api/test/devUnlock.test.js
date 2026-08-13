import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isDevUnlockCode } from '../src/devUnlock.js';

describe('isDevUnlockCode', () => {
  const originalEnv = process.env.DEV_UNLOCK_CODE;

  beforeEach(() => {
    process.env.DEV_UNLOCK_CODE = 'super-secret-dev-code';
  });

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.DEV_UNLOCK_CODE;
    else process.env.DEV_UNLOCK_CODE = originalEnv;
  });

  it('returns true when the license key matches the env var exactly', () => {
    expect(isDevUnlockCode('super-secret-dev-code')).toBe(true);
  });

  it('returns false when the license key does not match', () => {
    expect(isDevUnlockCode('wrong-code')).toBe(false);
  });

  it('returns false when the license key differs only in case', () => {
    expect(isDevUnlockCode('Super-Secret-Dev-Code')).toBe(false);
  });

  it('returns false for a same-length but different value', () => {
    expect(isDevUnlockCode('super-secret-dev-cod3')).toBe(false);
  });

  it('returns false when DEV_UNLOCK_CODE is not set', () => {
    delete process.env.DEV_UNLOCK_CODE;
    expect(isDevUnlockCode('super-secret-dev-code')).toBe(false);
  });

  it('returns false when the license key is empty', () => {
    expect(isDevUnlockCode('')).toBe(false);
  });
});
