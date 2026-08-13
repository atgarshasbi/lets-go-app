const { app } = require('@azure/functions');
const { getContainer } = require('../cosmosClient');
const { verifyGumroadLicense } = require('../gumroad');
const { createDefaultRecord, assignDeviceSlot } = require('../deviceSlots');
const { isDevUnlockCode } = require('../devUnlock');

// Real implementations are the defaults; tests pass fakes via `deps` so
// this stays testable without mocking CommonJS `require()` calls.
async function verifyLicenseHandler(request, context, deps = {}) {
  const {
    verifyGumroadLicenseFn = verifyGumroadLicense,
    getContainerFn = getContainer,
  } = deps;

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

  if (isDevUnlockCode(licenseKey)) {
    return { status: 200, jsonBody: { status: 'unlocked' } };
  }

  const gumroadResult = await verifyGumroadLicenseFn(licenseKey);
  if (!gumroadResult.valid) {
    return { status: 402, jsonBody: { error: gumroadResult.reason } };
  }

  const container = getContainerFn();
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
}

app.http('verifyLicense', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'verify-license',
  handler: verifyLicenseHandler,
});

module.exports = { verifyLicenseHandler };
