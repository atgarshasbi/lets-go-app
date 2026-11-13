// Marketing/promo unlock codes (e.g. handed out in ads or to influencers).
// Unlike Gumroad keys these were never sold, so they skip Gumroad entirely —
// but from here on they go through the exact same device-slot flow as a
// verified Gumroad key (one activation per code, tracked in Cosmos), so a
// code can't be reused on unlimited devices.
//
// The codes themselves live only in the Function App's MARKETING_CODES
// environment variable (comma-separated), never in git, so a public repo
// doesn't leak them before they're handed out.
function marketingCodeSet() {
  const raw = process.env.MARKETING_CODES || '';
  return new Set(raw.split(',').map(c => c.trim()).filter(Boolean));
}

function isMarketingCode(licenseKey) {
  if (!licenseKey) return false;
  return marketingCodeSet().has(licenseKey);
}

module.exports = { isMarketingCode };
