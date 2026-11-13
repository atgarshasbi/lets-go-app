import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isMarketingCode } from '../src/marketingCodes.js';

describe('isMarketingCode', () => {
  const originalEnv = process.env.MARKETING_CODES;

  beforeEach(() => {
    process.env.MARKETING_CODES = 'PROMO-AAAA-1111, PROMO-BBBB-2222,PROMO-CCCC-3333';
  });

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.MARKETING_CODES;
    else process.env.MARKETING_CODES = originalEnv;
  });

  it('returns true for a code in the list', () => {
    expect(isMarketingCode('PROMO-AAAA-1111')).toBe(true);
  });

  it('tolerates surrounding whitespace in the env var list', () => {
    expect(isMarketingCode('PROMO-BBBB-2222')).toBe(true);
  });

  it('returns false for a code not in the list', () => {
    expect(isMarketingCode('PROMO-ZZZZ-9999')).toBe(false);
  });

  it('returns false when MARKETING_CODES is not set', () => {
    delete process.env.MARKETING_CODES;
    expect(isMarketingCode('PROMO-AAAA-1111')).toBe(false);
  });

  it('returns false for an empty license key', () => {
    expect(isMarketingCode('')).toBe(false);
  });
});
