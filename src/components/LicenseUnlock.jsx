import { useState } from 'react';
import { useTheme } from '../theme';

const GUMROAD_URL = 'https://parentingfun.gumroad.com/l/mvmlqj';

export default function LicenseUnlock({ verifying, error, onRedeem }) {
  const theme = useTheme();
  const [key, setKey] = useState('');

  function submit(e) {
    e.preventDefault();
    onRedeem(key);
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5 text-center">
      <div className="text-4xl mb-2">🔓</div>
      <h2 className="text-lg font-black mb-1" style={{ color: theme.primary }}>
        Unlock the Full Experience
      </h2>
      <p className="text-sm text-gray-500 font-bold mb-4">
        One small payment. No subscription, no ads, ever.
      </p>

      <ul className="text-left text-sm font-bold text-gray-600 space-y-2 mb-5">
        <li className="flex items-start gap-2">
          <span className="text-lg leading-none">✏️</span>
          <span>Build custom routines — add, remove & reorder any tasks</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-lg leading-none">🎨</span>
          <span>6 fun color themes to match your kid&apos;s style</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-lg leading-none">🎉</span>
          <span>6 celebration characters for the &quot;All Done!&quot; screen</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-lg leading-none">⏱️</span>
          <span>A focus timer tuned to your own settings</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-lg leading-none">🔐</span>
          <span>A parent PIN only you know</span>
        </li>
      </ul>

      <a
        href={GUMROAD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 mb-4 text-white font-black rounded-xl shadow transition active:scale-95"
        style={{ backgroundColor: theme.primary }}
      >
        Buy Unlock — $4.99 CAD
      </a>

      <form onSubmit={submit} className="text-left">
        <label className="block text-sm font-bold text-gray-600 mb-1">
          Already purchased? Enter your license key
        </label>
        <input
          type="text"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
          className="w-full border-2 border-gray-200 focus:outline-none rounded-xl px-4 py-2 font-bold mb-2 transition"
          onFocus={e => (e.target.style.borderColor = theme.primary)}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />

        {error && <p className="text-sm font-bold text-red-500 mb-2">❌ {error}</p>}

        <button
          type="submit"
          disabled={verifying}
          className="w-full py-3 text-white font-bold rounded-xl transition active:scale-95 disabled:opacity-60"
          style={{ backgroundColor: theme.primary }}
        >
          {verifying ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
