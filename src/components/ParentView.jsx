import { useState } from 'react';
import RoutinesPanel from './RoutinesPanel';
import Settings from './Settings';
import { useTheme } from '../theme';

export default function ParentView({
  childName, setChildName,
  pin, setPin,
  timerMinutes, setTimerMinutes,
  timerMaxMinutes, setTimerMaxMinutes,
  themeKey, setThemeKey,
  celebrationCharacter, setCelebrationCharacter,
  sections, setSections,
  onBack,
}) {
  const theme = useTheme();
  const [tab, setTab] = useState('routines');

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-10"
        style={{ backgroundColor: theme.primary }}
      >
        <h1 className="text-lg font-black">🔒 Parent Mode</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('routines')}
            className="px-3 py-1 rounded-full text-sm font-bold transition"
            style={tab === 'routines'
              ? { backgroundColor: 'white', color: theme.primary }
              : { backgroundColor: 'rgba(255,255,255,0.2)' }
            }
          >
            📋 Routines
          </button>
          <button
            onClick={() => setTab('settings')}
            className="px-3 py-1 rounded-full text-sm font-bold transition"
            style={tab === 'settings'
              ? { backgroundColor: 'white', color: theme.primary }
              : { backgroundColor: 'rgba(255,255,255,0.2)' }
            }
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto pb-8">
        {tab === 'routines' ? (
          <RoutinesPanel sections={sections} setSections={setSections} />
        ) : (
          <Settings
            childName={childName}
            setChildName={setChildName}
            pin={pin}
            setPin={setPin}
            timerMinutes={timerMinutes}
            setTimerMinutes={setTimerMinutes}
            timerMaxMinutes={timerMaxMinutes}
            setTimerMaxMinutes={setTimerMaxMinutes}
            themeKey={themeKey}
            setThemeKey={setThemeKey}
            celebrationCharacter={celebrationCharacter}
            setCelebrationCharacter={setCelebrationCharacter}
          />
        )}

        <button
          onClick={onBack}
          className="w-full mt-6 py-3 text-white font-black rounded-2xl shadow transition active:scale-95"
          style={{ backgroundColor: theme.primary }}
        >
          ← Back to Kids View
        </button>
      </div>
    </div>
  );
}
