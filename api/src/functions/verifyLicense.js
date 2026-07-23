const { app } = require('@azure/functions');
const { getContainer } = require('../cosmosClient');
const { verifyGumroadLicense } = require('../gumroad');
const { createDefaultRecord, assignDeviceSlot } = require('../deviceSlots');

app.http('verifyLicense', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'verify-license',
  handler: async (request, context) => {
    let body;
    try {
      body = await request.json();
    } catch {
      return { status: 400, jsonBody: { error: 'Invalid JSON body' } };
    }

    const { licenseKey, deviceId } = body || {};
    if (!licenseKey || !deviceId) {
      return { status: 400, jsonBody: { error: 'licenseKey and deviceId are required' } };
    }

    const gumroadResult = await verifyGumroadLicense(licenseKey);
    if (!gumroadResult.valid) {
      return { status: 402, jsonBody: { error: gumroadResult.reason } };
    }

    const container = getContainer();
    const existing = await container
      .item(licenseKey, licenseKey)
      .read()
      .then(r => r.resource)
      .catch(() => null);

    const record = existing || createDefaultRecord(licenseKey);
    const outcome = assignDeviceSlot(record, deviceId);

    if (outcome.status === 'slot_full') {
      return {
        status: 409,
        jsonBody: {
          status: 'slot_full',
          activeDevices: record.activeDevices,
        },
      };
    }

    await container.items.upsert(outcome.record);

    return {
      status: 200,
      jsonBody: { status: 'unlocked' },
    };
  },
});
