import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Override locally via .env.local (VITE_VERIFY_URL=http://localhost:7071/api/verify-license)
// to test against `func start` instead of production.
const VERIFY_URL = import.meta.env.VITE_VERIFY_URL
  || 'https://lets-go-license-api-bhfjcdapdvaph5dv.centralus-01.azurewebsites.net/api/verify-license';

function randomId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useLicense() {
  const [deviceId] = useLocalStorage('deviceId', randomId());
  const [unlocked, setUnlocked] = useLocalStorage('unlocked', false);
  const [licenseKey, setLicenseKey] = useLocalStorage('licenseKey', '');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  async function callVerify(key) {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: key, deviceId }),
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  }

  async function redeem(key) {
    const trimmed = key.trim();
    if (!trimmed) { setError('Enter a license key'); return false; }

    setVerifying(true);
    setError('');
    try {
      const { status, body } = await callVerify(trimmed);
      if (status === 200 && body.status === 'unlocked') {
        setLicenseKey(trimmed);
        setUnlocked(true);
        return true;
      }
      if (status === 409) {
        setError('This key is already used on the maximum number of devices for its tier.');
        return false;
      }
      setError(body.error || 'That license key is not valid.');
      return false;
    } catch {
      setError('Could not reach the license server. Check your connection and try again.');
      return false;
    } finally {
      setVerifying(false);
    }
  }

  // Event-driven revalidation (called when the Parent Panel opens), not polling.
  // Offline / unreachable falls back silently to the cached unlock state.
  async function revalidate() {
    if (!licenseKey) return;
    try {
      const { status, body } = await callVerify(licenseKey);
      if (status === 200 && body.status === 'unlocked') {
        setUnlocked(true);
      } else if (status === 402 || status === 409) {
        // Key was refunded/invalidated, or this device lost its slot to another device.
        setUnlocked(false);
      }
    } catch {
      // Network error — keep cached unlock state, don't lock the parent out offline.
    }
  }

  return { unlocked, licenseKey, verifying, error, redeem, revalidate };
}
