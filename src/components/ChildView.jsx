import { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import ProgressBar from './ProgressBar';
import StarCounter from './StarCounter';
import CountdownTimer from './CountdownTimer';
import CelebrationScreen from './CelebrationScreen';

export default function ChildView({
  childName, totalStars, timerMinutes, timerResetToken,
  taskPool, todayList, completedToday,
  handleTaskToggle, onParentPress,
}) {
  const todayTasks = todayList
    .map(id => taskPool.find(t => t.id === id))
    .filter(Boolean);

  const allDone = todayTasks.length > 0 && completedToday.length >= todayTasks.length;
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (allDone) setShowCelebration(true);
  }, [allDone]);

  useEffect(() => {
    if (!allDone) setShowCelebration(false);
  }, [completedToday.length]);

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4 relative">
      {showCelebration && (
        <CelebrationScreen
          childName={childName}
          starsEarned={todayTasks.length}
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

      <ProgressBar done={completedToday.length} total={todayTasks.length} />

      <div className="w-full max-w-md mt-4 space-y-3 pb-16">
        {todayTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-lg font-bold">
            No tasks today!<br />Ask a parent to add some. 😊
          </div>
        ) : (
          todayTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              done={completedToday.includes(task.id)}
              onToggle={() => handleTaskToggle(task.id)}
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
