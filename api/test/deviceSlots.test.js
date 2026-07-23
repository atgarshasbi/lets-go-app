import { describe, it, expect } from 'vitest';
import { createDefaultRecord, assignDeviceSlot } from '../src/deviceSlots.js';

describe('createDefaultRecord', () => {
  it('creates a basic-tier record with one slot and no devices', () => {
    const record = createDefaultRecord('ABC123');

    expect(record).toEqual({
      id: 'ABC123',
      licenseKey: 'ABC123',
      tier: 'basic',
      maxSlots: 1,
      activeDevices: [],
    });
  });
});

describe('assignDeviceSlot', () => {
  it('unlocks and adds the device when a slot is free', () => {
    const record = createDefaultRecord('ABC123');

    const outcome = assignDeviceSlot(record, 'device-1');

    expect(outcome.status).toBe('unlocked');
    expect(outcome.record.activeDevices).toHaveLength(1);
    expect(outcome.record.activeDevices[0].deviceId).toBe('device-1');
    expect(outcome.record.activeDevices[0].activatedAt).toEqual(expect.any(String));
  });

  it('unlocks without adding a duplicate when the device already has a slot', () => {
    const record = {
      ...createDefaultRecord('ABC123'),
      activeDevices: [{ deviceId: 'device-1', activatedAt: '2026-01-01T00:00:00.000Z' }],
    };

    const outcome = assignDeviceSlot(record, 'device-1');

    expect(outcome.status).toBe('unlocked');
    expect(outcome.record.activeDevices).toHaveLength(1);
  });

  it('returns slot_full when maxSlots is already reached by a different device', () => {
    const record = {
      ...createDefaultRecord('ABC123'),
      activeDevices: [{ deviceId: 'device-1', activatedAt: '2026-01-01T00:00:00.000Z' }],
    };

    const outcome = assignDeviceSlot(record, 'device-2');

    expect(outcome.status).toBe('slot_full');
    expect(outcome.record.activeDevices).toHaveLength(1);
  });

  it('supports a Family-tier record with 2 slots without any code changes', () => {
    const record = { ...createDefaultRecord('FAM123'), tier: 'family', maxSlots: 2 };

    const first = assignDeviceSlot(record, 'device-1');
    const second = assignDeviceSlot(first.record, 'device-2');
    const third = assignDeviceSlot(second.record, 'device-3');

    expect(first.status).toBe('unlocked');
    expect(second.status).toBe('unlocked');
    expect(second.record.activeDevices).toHaveLength(2);
    expect(third.status).toBe('slot_full');
  });
});
