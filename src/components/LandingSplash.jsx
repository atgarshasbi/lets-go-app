import { useTheme } from '../theme';

export default function LandingSplash({ onStart }) {
  const theme = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="text-6xl mb-2">🌟</div>
      <h1 className="text-3xl font-black mb-2" style={{ color: theme.primary }}>
        Let&apos;s Go!
      </h1>
      <p className="text-lg font-bold text-gray-600 max-w-sm mb-1">
        A fun daily routine & star chart app for toddlers and kids
      </p>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Free morning routines, bedtime checklists, and potty training charts — with stars,
        celebrations, and a countdown timer kids love.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm">
        <Feature emoji="⭐" label="Earn stars" />
        <Feature emoji="⏱️" label="Countdown timer" />
        <Feature emoji="🎉" label="Celebrations" />
      </div>

      <button
        onClick={onStart}
        className="px-10 py-4 text-white font-black text-lg rounded-2xl shadow-lg transition active:scale-95"
        style={{ backgroundColor: theme.primary }}
      >
        Start Now — It&apos;s Free
      </button>

      <p className="text-xs text-gray-400 font-bold mt-4">
        No sign up. No app store. Just open and go.
      </p>
    </div>
  );
}

function Feature({ emoji, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl">{emoji}</span>
      <span className="text-xs font-bold text-gray-500">{label}</span>
    </div>
  );
}
