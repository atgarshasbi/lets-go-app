import { useState } from 'react';
import { THEMES, CHARACTERS } from '../theme';

export default function Settings({
  childName, setChildName, pin, setPin,
  timerMinutes, setTimerMinutes, timerMaxMinutes, setTimerMaxMinutes,
  themeKey, setThemeKey, celebrationCharacter, setCelebrationCharacter,
}) {
  const [name, setName] = useState(childName);
  const [showTimer, setShowTimer] = useState(timerMinutes > 0);
  const [generalSaved, setGeneralSaved] = useState(false);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  const theme = THEMES[themeKey] || THEMES.purple;

  function saveGeneral() {
    if (name.trim()) setChildName(name.trim());
    if (!showTimer) setTimerMinutes(0);
    else if (timerMinutes === 0) setTimerMinutes(5); // restore a sensible default
    setGeneralSaved(true);
    setTimeout(() => setGeneralSaved(false), 2000);
  }

  function changePin() {
    if (currentPin !== pin) { setPinMsg('❌ Current PIN is wrong'); return; }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { setPinMsg('❌ PIN must be exactly 4 digits'); return; }
    if (newPin !== confirmPin) { setPinMsg('❌ PINs do not match'); return; }
    setPin(newPin);
    setCurrentPin(''); setNewPin(''); setConfirmPin('');
    setPinMsg('✅ PIN changed!');
  }

  function pinInput(val, setter) {
    setter(val.replace(/\D/g, '').slice(0, 4));
  }

  return (
    <div className="space-y-4">
      {/* General */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-black mb-3" style={{ color: theme.primary }}>⚙️ General</h2>

        <label className="block text-sm font-bold text-gray-600 mb-1">Child&apos;s name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border-2 border-gray-200 focus:outline-none rounded-xl px-4 py-2 font-bold mb-4 transition"
          onFocus={e => (e.target.style.borderColor = theme.primary)}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />

        <div className="flex items-center justify-between mb-4 py-2">
          <span className="text-sm font-bold text-gray-600">Show countdown timer</span>
          <button
            onClick={() => setShowTimer(s => !s)}
            className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
            style={{ backgroundColor: showTimer ? theme.primary : '#d1d5db' }}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${showTimer ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        <button
          onClick={saveGeneral}
          className="w-full py-3 text-white font-bold rounded-xl transition active:scale-95"
          style={{ backgroundColor: theme.primary }}
        >
          {generalSaved ? '✅ Saved!' : 'Save'}
        </button>
      </div>

      {/* Theme color */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-black mb-3" style={{ color: theme.primary }}>🎨 Theme Color</h2>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(THEMES).map(([key, colors]) => (
            <button
              key={key}
              onClick={() => setThemeKey(key)}
              className="w-10 h-10 rounded-full transition-all active:scale-95"
              style={{
                backgroundColor: colors.primary,
                transform: themeKey === key ? 'scale(1.3)' : 'scale(1)',
                boxShadow: themeKey === key
                  ? `0 0 0 3px white, 0 0 0 5px ${colors.primary}`
                  : '0 1px 3px rgba(0,0,0,0.2)',
              }}
              title={key}
            />
          ))}
        </div>
      </div>

      {/* All Done character */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-black mb-3" style={{ color: theme.primary }}>🎊 All Done Screen</h2>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(CHARACTERS).map(([key, { emoji, label }]) => (
            <button
              key={key}
              onClick={() => setCelebrationCharacter(key)}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition active:scale-95"
              style={{
                borderColor: celebrationCharacter === key ? theme.primary : '#e5e7eb',
                backgroundColor: celebrationCharacter === key ? theme.light : 'transparent',
              }}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs font-bold text-gray-600">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Change PIN */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-black mb-1" style={{ color: theme.primary }}>🔒 Change PIN</h2>
        <p className="text-xs text-gray-400 font-bold mb-3">Default PIN is 1234</p>

        {[
          ['Current PIN', currentPin, v => pinInput(v, setCurrentPin)],
          ['New PIN', newPin, v => pinInput(v, setNewPin)],
          ['Confirm New PIN', confirmPin, v => pinInput(v, setConfirmPin)],
        ].map(([lbl, val, onChange]) => (
          <div key={lbl} className="mb-3">
            <label className="block text-sm font-bold text-gray-600 mb-1">{lbl}</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={val}
              onChange={e => onChange(e.target.value)}
              className="w-full border-2 border-gray-200 focus:outline-none rounded-xl px-4 py-2 font-bold transition tracking-widest text-center text-xl"
              placeholder="••••"
              onFocus={e => (e.target.style.borderColor = theme.primary)}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>
        ))}

        {pinMsg && (
          <p className={`text-sm font-bold mb-3 ${pinMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
            {pinMsg}
          </p>
        )}

        <button
          onClick={changePin}
          className="w-full py-3 text-white font-bold rounded-xl transition active:scale-95"
          style={{ backgroundColor: theme.primary }}
        >
          Change PIN
        </button>
      </div>

      {/* Legal */}
      <div className="text-center text-xs text-gray-400 font-bold py-2 space-x-3">
        <a href="/privacy.html" className="underline">Privacy Policy</a>
        <span>&middot;</span>
        <a href="/terms.html" className="underline">Terms of Service</a>
      </div>
    </div>
  );
}
