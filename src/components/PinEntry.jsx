import { useState } from 'react';

const DEFAULT_PIN = '1234';

function randomChallenge() {
  const a = 3 + Math.floor(Math.random() * 6); // 3-8
  const b = 3 + Math.floor(Math.random() * 6); // 3-8
  return { a, b, answer: a * b };
}

export default function PinEntry({ correctPin, setPin, onSuccess, onCancel }) {
  const [mode, setMode] = useState('enter'); // 'enter' | 'forgot' | 'reset'
  const [entered, setEntered] = useState('');
  const [shaking, setShaking] = useState(false);
  const [error, setError] = useState(false);

  const [challenge, setChallenge] = useState(randomChallenge);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeError, setChallengeError] = useState('');

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [resetError, setResetError] = useState('');

  function handleDigit(d) {
    if (entered.length >= 4 || shaking) return;
    const next = entered + d;
    setEntered(next);
    if (next.length === 4) {
      if (next === correctPin) {
        onSuccess();
      } else {
        setShaking(true);
        setError(true);
        setTimeout(() => {
          setEntered('');
          setShaking(false);
          setError(false);
        }, 600);
      }
    }
  }

  function handleBack() {
    if (shaking) return;
    setEntered(prev => prev.slice(0, -1));
    setError(false);
  }

  function submitChallenge(e) {
    e.preventDefault();
    if (Number(challengeAnswer) === challenge.answer) {
      setMode('reset');
      setChallengeError('');
    } else {
      setChallengeError('❌ Not quite — try again');
      setChallenge(randomChallenge());
      setChallengeAnswer('');
    }
  }

  function submitReset(e) {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setResetError('❌ PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setResetError('❌ PINs do not match');
      return;
    }
    setPin(newPin);
    onSuccess();
  }

  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xs">
          <div className="text-center mb-1 text-4xl">🧮</div>
          <h2 className="text-2xl font-black text-center text-purple-700 mb-1">Parent Check</h2>
          <p className="text-center text-gray-400 text-sm font-bold mb-6">
            Answer this to reset your PIN
          </p>

          <form onSubmit={submitChallenge}>
            <p className="text-center text-3xl font-black text-purple-700 mb-4">
              {challenge.a} &times; {challenge.b} = ?
            </p>
            <input
              type="number"
              inputMode="numeric"
              autoFocus
              value={challengeAnswer}
              onChange={e => setChallengeAnswer(e.target.value)}
              className="w-full border-2 border-gray-200 focus:outline-none focus:border-purple-500 rounded-xl px-4 py-2 font-bold mb-2 text-center text-xl transition"
            />
            {challengeError && (
              <p className="text-center text-red-500 text-sm font-bold mb-2">{challengeError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 mt-2 text-white font-bold rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 transition"
            >
              Submit
            </button>
          </form>

          <button
            onClick={() => { setMode('enter'); setEntered(''); }}
            className="w-full mt-3 py-2 text-gray-400 hover:text-gray-600 font-bold transition text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'reset') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xs">
          <div className="text-center mb-1 text-4xl">🔒</div>
          <h2 className="text-2xl font-black text-center text-purple-700 mb-1">Set a New PIN</h2>
          <p className="text-center text-gray-400 text-sm font-bold mb-6">
            Choose a 4-digit PIN you&apos;ll remember
          </p>

          <form onSubmit={submitReset}>
            {[
              ['New PIN', newPin, v => setNewPin(v.replace(/\D/g, '').slice(0, 4))],
              ['Confirm New PIN', confirmPin, v => setConfirmPin(v.replace(/\D/g, '').slice(0, 4))],
            ].map(([lbl, val, onChange]) => (
              <div key={lbl} className="mb-3">
                <label className="block text-sm font-bold text-gray-600 mb-1">{lbl}</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={val}
                  onChange={e => onChange(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:outline-none focus:border-purple-500 rounded-xl px-4 py-2 font-bold transition tracking-widest text-center text-xl"
                  placeholder="••••"
                />
              </div>
            ))}

            {resetError && (
              <p className="text-sm font-bold text-red-500 mb-3">{resetError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 text-white font-bold rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 transition"
            >
              Save & Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xs">
        <div className="text-center mb-1 text-4xl">🔒</div>
        <h2 className="text-2xl font-black text-center text-purple-700 mb-1">Parent Mode</h2>
        <p className="text-center text-gray-400 text-sm font-bold mb-1">Enter your PIN</p>
        {correctPin === DEFAULT_PIN && (
          <p className="text-center text-gray-400 text-xs font-bold mb-5">
            New here? The default PIN is <span className="text-purple-600">1234</span>
          </p>
        )}
        {correctPin !== DEFAULT_PIN && <div className="mb-5" />}

        <div className={`flex justify-center gap-4 mb-3 ${shaking ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={[
                'w-12 h-12 rounded-full border-4 flex items-center justify-center text-2xl font-black transition-all',
                entered.length > i
                  ? (error ? 'bg-red-400 border-red-500 text-white' : 'bg-purple-500 border-purple-600 text-white')
                  : 'bg-gray-100 border-gray-200',
              ].join(' ')}
            >
              {entered.length > i ? '★' : ''}
            </div>
          ))}
        </div>

        {error && <p className="text-center text-red-500 text-sm font-bold mb-3">Wrong PIN, try again!</p>}
        {!error && <div className="mb-3 h-5" />}

        <div className="grid grid-cols-3 gap-3 mb-3">
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="py-4 text-2xl font-black bg-purple-50 hover:bg-purple-100 active:scale-95 rounded-2xl transition border-2 border-purple-100"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="py-4 text-2xl font-black bg-purple-50 hover:bg-purple-100 active:scale-95 rounded-2xl transition border-2 border-purple-100"
          >
            0
          </button>
          <button
            onClick={handleBack}
            className="py-4 text-xl font-black bg-red-50 hover:bg-red-100 active:scale-95 rounded-2xl transition border-2 border-red-100"
          >
            ⌫
          </button>
        </div>

        <button
          onClick={() => { setChallenge(randomChallenge()); setChallengeAnswer(''); setMode('forgot'); }}
          className="w-full py-1 text-purple-400 hover:text-purple-600 font-bold transition text-sm"
        >
          Forgot PIN?
        </button>
        <button
          onClick={onCancel}
          className="w-full py-2 text-gray-400 hover:text-gray-600 font-bold transition text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
