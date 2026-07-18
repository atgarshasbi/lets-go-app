import { useState, useEffect } from 'react';
import CollapsibleSection from './CollapsibleSection';
import ProgressBar from './ProgressBar';
import StarJar from './StarJar';
import CreatureTimer from './CreatureTimer';
import CelebrationScreen from './CelebrationScreen';
import InstallBanner from './InstallBanner';
import { useTheme, useDarkMode } from '../theme';

export default function ChildView({
  childName, totalStars, timerMinutes, setTimerMinutes, timerMaxMinutes, timerResetToken,
  timerPaused, sections, completedToday, celebrationCharacter,
  soundEnabled, setSoundEnabled,
  handleTaskToggle, handleResetToday, handleBonusStar, onParentPress, onTimerPause, onTimerResume,
}) {
  const theme = useTheme();
  const [darkMode, setDarkMode] = useDarkMode();
  const visibleSections = sections.filter(s => s.enabled !== false);
  const allTasks = visibleSections.flatMap(s => s.tasks);
  const doneCount = allTasks.filter(t => completedToday.includes(t.id)).length;
  const allDone = allTasks.length > 0 && doneCount >= allTasks.length;
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (allDone) setShowCelebration(true);
  }, [allDone]);

  useEffect(() => {
    if (!allDone) setShowCelebration(false);
  }, [doneCount]);

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4 relative">
      {showCelebration && (
        <CelebrationScreen
          childName={childName}
          starsEarned={totalStars}
          celebrationCharacter={celebrationCharacter}
          onClose={() => { setShowCelebration(false); onTimerResume(); }}
        />
      )}

      <InstallBanner />

      <div className="text-center mb-3">
        <div className="text-5xl mb-1">🌟</div>
        <h1 className="text-3xl font-black drop-shadow" style={{ color: theme.primary }}>
          Hi, {childName}!
        </h1>
      </div>

      {timerMinutes > 0 && (
        <CreatureTimer
          minutes={timerMinutes}
          setMinutes={setTimerMinutes}
          maxMinutes={timerMaxMinutes}
          running={!timerPaused && !showCelebration}
          resetToken={timerResetToken}
          completionPct={allTasks.length > 0 ? doneCount / allTasks.length : 0}
          soundEnabled={soundEnabled}
        />
      )}

      <ProgressBar done={doneCount} total={allTasks.length} />

      {(totalStars > 0 || doneCount > 0) && (
        <button
          onClick={handleResetToday}
          className="mt-3 bg-white/80 hover:bg-white active:scale-95 border-2 text-gray-500 font-bold text-sm py-2 px-5 rounded-full shadow transition"
          style={{ borderColor: theme.border }}
        >
          🔄 Start Over
        </button>
      )}

      <div className="w-full max-w-md mt-4 space-y-4 pb-4">
        {visibleSections.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-slate-400 py-8 text-lg font-bold">
            No tasks today!<br />Ask a parent to add some. 😊
          </div>
        ) : (
          visibleSections.map(section => (
            <CollapsibleSection
              key={section.id}
              section={section}
              completedToday={completedToday}
              onToggleTask={handleTaskToggle}
            />
          ))
        )}
      </div>

      <StarJar totalStars={totalStars} onBonusStar={handleBonusStar} />

      {(doneCount > 0 || totalStars > 0) && (
        <button
          onClick={() => { onTimerPause(); setShowCelebration(true); }}
          className="mb-4 text-white font-black text-xl py-4 px-10 rounded-full shadow-xl active:scale-95 transition"
          style={{ backgroundColor: theme.primary }}
        >
          🎉 All Done!
        </button>
      )}

      <button
        onClick={() => setSoundEnabled(s => !s)}
        className="fixed bottom-4 left-4 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-300 text-sm font-bold py-2 px-4 rounded-full shadow-lg transition backdrop-blur-sm"
        title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      <button
        onClick={() => setDarkMode(d => !d)}
        className="fixed bottom-4 left-20 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-300 text-sm font-bold py-2 px-4 rounded-full shadow-lg transition backdrop-blur-sm"
        title={darkMode ? 'Day mode' : 'Night mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <button
        onClick={onParentPress}
        className="fixed bottom-4 right-4 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-300 text-sm font-bold py-2 px-4 rounded-full shadow-lg transition backdrop-blur-sm"
      >
        🔒 Parent
      </button>
    </div>
  );
}
