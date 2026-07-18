import { useState } from 'react';
import { useTheme } from '../theme';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export default function InstallBanner() {
  const theme = useTheme();
  const { isIOS, isInstalled, canPromptInstall, promptInstall } = useInstallPrompt();
  const [showHelp, setShowHelp] = useState(false);

  if (isInstalled) return null;

  function handleClick() {
    if (canPromptInstall) {
      promptInstall();
    } else {
      setShowHelp(h => !h);
    }
  }

  return (
    <div className="w-full max-w-md mb-3">
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold rounded-2xl shadow transition active:scale-95"
        style={{ backgroundColor: theme.primary }}
      >
        <span className="text-xl">📲</span> Install App
      </button>

      {showHelp && (
        <div className="mt-2 rounded-xl p-3 text-xs font-bold text-gray-700" style={{ backgroundColor: theme.light }}>
          {isIOS ? (
            <>Tap <strong>Share</strong> (square with an arrow) below, then <strong>&quot;Add to Home Screen&quot;</strong>.</>
          ) : (
            <>Open your browser menu (usually ⋮ or &bull;&bull;&bull;) and tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</>
          )}
        </div>
      )}
    </div>
  );
}
