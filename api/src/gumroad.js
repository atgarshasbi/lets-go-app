async function verifyGumroadLicense(licenseKey) {
  const params = new URLSearchParams({
    product_permalink: process.env.GUMROAD_PRODUCT_PERMALINK,
    license_key: licenseKey,
    increment_uses_count: 'false',
  });

  const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const data = await response.json();

  if (!data.success) {
    return { valid: false, reason: 'License key not found' };
  }
  if (data.purchase?.refunded || data.purchase?.chargebacked) {
    return { valid: false, reason: 'This purchase was refunded' };
  }

  return { valid: true };
}

module.exports = { verifyGumroadLicense };
