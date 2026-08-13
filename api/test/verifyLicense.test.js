import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyLicenseHandler } from '../src/functions/verifyLicense.js';

function makeRequest(body) {
  return { json: async () => body };
}

describe('verifyLicenseHandler', () => {
  const originalEnv = process.env.DEV_UNLOCK_CODE;
  let verifyGumroadLicenseFn;
  let getContainerFn;

  beforeEach(() => {
    verifyGumroadLicenseFn = vi.fn();
    getContainerFn = vi.fn();
  });

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.DEV_UNLOCK_CODE;
    else process.env.DEV_UNLOCK_CODE = originalEnv;
  });

  it('returns 400 when the JSON body is invalid', async () => {
    const request = { json: async () => { throw new Error('bad json'); } };
    const result = await verifyLicenseHandler(request, {});

    expect(result).toEqual({ status: 400, jsonBody: { error: 'Invalid JSON body' } });
  });

  it('returns 400 when licenseKey or deviceId is missing', async () => {
    const result = await verifyLicenseHandler(makeRequest({ licenseKey: 'ABC' }), {});

    expect(result.status).toBe(400);
  });

  describe('dev unlock code', () => {
    beforeEach(() => {
      process.env.DEV_UNLOCK_CODE = 'super-secret-dev-code';
    });

    it('unlocks immediately without calling Gumroad or Cosmos', async () => {
      const result = await verifyLicenseHandler(
        makeRequest({ licenseKey: 'super-secret-dev-code', deviceId: 'device-1' }),
        {},
        { verifyGumroadLicenseFn, getContainerFn }
      );

      expect(result).toEqual({ status: 200, jsonBody: { status: 'unlocked' } });
      expect(verifyGumroadLicenseFn).not.toHaveBeenCalled();
      expect(getContainerFn).not.toHaveBeenCalled();
    });

    it('falls through to Gumroad when the key does not match the dev code', async () => {
      verifyGumroadLicenseFn.mockResolvedValue({ valid: false, reason: 'License key not found' });

      const result = await verifyLicenseHandler(
        makeRequest({ licenseKey: 'not-the-dev-code', deviceId: 'device-1' }),
        {},
        { verifyGumroadLicenseFn, getContainerFn }
      );

      expect(verifyGumroadLicenseFn).toHaveBeenCalledWith('not-the-dev-code');
      expect(result).toEqual({ status: 402, jsonBody: { error: 'License key not found' } });
    });
  });

  describe('normal Gumroad flow (no dev code set)', () => {
    beforeEach(() => {
      delete process.env.DEV_UNLOCK_CODE;
    });

    it('returns 402 when the Gumroad key is invalid', async () => {
      verifyGumroadLicenseFn.mockResolvedValue({ valid: false, reason: 'License key not found' });

      const result = await verifyLicenseHandler(
        makeRequest({ licenseKey: 'REAL-KEY', deviceId: 'device-1' }),
        {},
        { verifyGumroadLicenseFn, getContainerFn }
      );

      expect(result).toEqual({ status: 402, jsonBody: { error: 'License key not found' } });
      expect(getContainerFn).not.toHaveBeenCalled();
    });

    it('unlocks and persists a new device slot when the key is valid', async () => {
      verifyGumroadLicenseFn.mockResolvedValue({ valid: true });
      const upsert = vi.fn().mockResolvedValue({});
      const read = vi.fn().mockResolvedValue({ resource: null });
      getContainerFn.mockReturnValue({
        item: () => ({ read }),
        items: { upsert },
      });

      const result = await verifyLicenseHandler(
        makeRequest({ licenseKey: 'REAL-KEY', deviceId: 'device-1' }),
        {},
        { verifyGumroadLicenseFn, getContainerFn }
      );

      expect(result).toEqual({ status: 200, jsonBody: { status: 'unlocked' } });
      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          licenseKey: 'REAL-KEY',
          activeDevices: [expect.objectContaining({ deviceId: 'device-1' })],
        })
      );
    });

    it('returns 409 when the device slot is already full', async () => {
      verifyGumroadLicenseFn.mockResolvedValue({ valid: true });
      const existingRecord = {
        id: 'REAL-KEY',
        licenseKey: 'REAL-KEY',
        tier: 'basic',
        maxSlots: 1,
        activeDevices: [{ deviceId: 'other-device', activatedAt: '2026-01-01T00:00:00.000Z' }],
      };
      const upsert = vi.fn();
      const read = vi.fn().mockResolvedValue({ resource: existingRecord });
      getContainerFn.mockReturnValue({
        item: () => ({ read }),
        items: { upsert },
      });

      const result = await verifyLicenseHandler(
        makeRequest({ licenseKey: 'REAL-KEY', deviceId: 'device-2' }),
        {},
        { verifyGumroadLicenseFn, getContainerFn }
      );

      expect(result.status).toBe(409);
      expect(upsert).not.toHaveBeenCalled();
    });
  });
});
