import { useState } from 'react';

export default function Settings({ childName, setChildName, pin, setPin, timerMinutes, setTimerMinutes }) {
  const [name, setName] = useState(childName);
  const [timer, setTimer] = useState(String(timerMinutes));
  const [generalSaved, setGeneralSaved] = useState(false);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  function saveGeneral() {
    if (name.trim()) setChildName(name.trim());
    const mins = parseInt(timer, 10);
    if (!isNaN(mins) && mins >= 0 && mins <= 120) setTimerMinutes(mins);
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
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-black text-purple-700 mb-3">⚙️ General</h2>

        <label className="block text-sm font-bold text-gray-600 mb-1">Child&apos;s name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border-2 border-purple-200 focus:border-purple-500 rounded-xl px-4 py-2 font-bold outline-none mb-4 transition"
        />

        <label className="block text-sm font-bold text-gray-600 mb-1">
          Timer duration (minutes — set to 0 to hide timer)
        </label>
        <input
          type="number"
          min="0"
          max="120"
          value={timer}
          onChange={e => setTimer(e.target.value)}
          className="w-full border-2 border-purple-200 focus:border-purple-500 rounded-xl px-4 py-2 font-bold outline-none mb-4 transition"
        />

        <button
          onClick={saveGeneral}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl transition"
        >
          {generalSaved ? '✅ Saved!' : 'Save'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-black text-purple-700 mb-3">🔒 Change PIN</h2>
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
              className="w-full border-2 border-purple-200 focus:border-purple-500 rounded-xl px-4 py-2 font-bold outline-none transition tracking-widest text-center text-xl"
              placeholder="••••"
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
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl transition"
        >
          Change PIN
        </button>
      </div>
    </div>
  );
}
