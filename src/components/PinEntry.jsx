import { useState } from 'react';

export default function PinEntry({ correctPin, onSuccess, onCancel }) {
  const [entered, setEntered] = useState('');
  const [shaking, setShaking] = useState(false);
  const [error, setError] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xs">
        <div className="text-center mb-1 text-4xl">🔒</div>
        <h2 className="text-2xl font-black text-center text-purple-700 mb-1">Parent Mode</h2>
        <p className="text-center text-gray-400 text-sm font-bold mb-6">Enter your PIN</p>

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
          onClick={onCancel}
          className="w-full py-2 text-gray-400 hover:text-gray-600 font-bold transition text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
