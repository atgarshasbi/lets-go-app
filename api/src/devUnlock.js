const crypto = require('crypto');

// Dev-only bypass, checked before Gumroad/Cosmos are touched. The secret
// lives only in the Function App's DEV_UNLOCK_CODE environment variable —
// never in client code — so it can be rotated or removed without a deploy.
function isDevUnlockCode(licenseKey) {
  const devCode = process.env.DEV_UNLOCK_CODE;
  if (!devCode || !licenseKey) return false;

  const a = Buffer.from(licenseKey, 'utf8');
  const b = Buffer.from(devCode, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { isDevUnlockCode };
