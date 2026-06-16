import { useState, useEffect } from 'react';
import CollapsibleSection from './CollapsibleSection';
import ProgressBar from './ProgressBar';
import StarCounter from './StarCounter';
import CountdownTimer from './CountdownTimer';
import CelebrationScreen from './CelebrationScreen';

export default function ChildView({
  childName, totalStars, timerMinutes, timerResetToken,
  sections, completedToday,
  handleTaskToggle, handleResetToday, onParentPress,
}) {
  const allTasks = sections.flatMap(s => s.tasks);
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
          starsEarned={allTasks.length}
          onClose={() => setShowCelebration(false)}
        />
      )}

      <div className="text-center mb-3">
        <div className="text-5xl mb-1">🌟</div>
        <h1 className="text-3xl font-black text-purple-700 drop-shadow">
          Hi, {childName}!
        </h1>
      </div>

      <StarCounter total={totalStars} />

      {timerMinutes > 0 && (
        <CountdownTimer
          minutes={timerMinutes}
          running={!allDone}
          resetToken={timerResetToken}
        />
      )}

      <ProgressBar done={doneCount} total={allTasks.length} />

      {doneCount > 0 && (
        <button
          onClick={handleResetToday}
          className="mt-3 bg-white/80 hover:bg-white active:scale-95 border-2 border-purple-200 text-purple-600 font-bold text-sm py-2 px-5 rounded-full shadow transition"
        >
          🔄 Start Over
        </button>
      )}

      <div className="w-full max-w-md mt-4 space-y-4 pb-16">
        {sections.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-lg font-bold">
            No tasks today!<br />Ask a parent to add some. 😊
          </div>
        ) : (
          sections.map(section => (
            <CollapsibleSection
              key={section.id}
              section={section}
              completedToday={completedToday}
              onToggleTask={handleTaskToggle}
            />
          ))
        )}
      </div>

      <button
        onClick={onParentPress}
        className="fixed bottom-4 right-4 bg-white/80 hover:bg-white border-2 border-gray-200 text-gray-500 hover:text-gray-700 text-sm font-bold py-2 px-4 rounded-full shadow-lg transition backdrop-blur-sm"
      >
        🔒 Parent
      </button>
    </div>
  );
}
