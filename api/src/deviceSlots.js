function createDefaultRecord(licenseKey) {
  return {
    id: licenseKey,
    licenseKey,
    tier: 'basic',
    maxSlots: 1,
    activeDevices: [],
  };
}

function assignDeviceSlot(record, deviceId) {
  const alreadyActive = record.activeDevices.some(d => d.deviceId === deviceId);
  if (alreadyActive) {
    return { status: 'unlocked', record };
  }

  if (record.activeDevices.length >= record.maxSlots) {
    return { status: 'slot_full', record };
  }

  const updatedRecord = {
    ...record,
    activeDevices: [
      ...record.activeDevices,
      { deviceId, activatedAt: new Date().toISOString() },
    ],
  };

  return { status: 'unlocked', record: updatedRecord };
}

module.exports = { createDefaultRecord, assignDeviceSlot };
