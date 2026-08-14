import { useTheme } from '../theme';

export default function UnlockBanner({ onPress }) {
  const theme = useTheme();

  return (
    <div className="w-full max-w-md mb-3">
      <button
        onClick={onPress}
        className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold rounded-2xl shadow transition active:scale-95"
        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.hover})` }}
      >
        <span className="text-xl">🔓</span> Unlock Everything
      </button>
    </div>
  );
}
