import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import TaskCard from './TaskCard';

const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bd6'];

function celebrate() {
  confetti({ particleCount: 70, spread: 70, startVelocity: 45, origin: { y: 0.7 }, colors: CONFETTI_COLORS });
  confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors: CONFETTI_COLORS });
  confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: CONFETTI_COLORS });
}

export default function CollapsibleSection({ section, completedToday, onToggleTask, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  const total = section.tasks.length;
  const done = section.tasks.filter(t => completedToday.includes(t.id)).length;
  const allDone = total > 0 && done === total;

  // Fire confetti only when this section transitions into "all done"
  // (not on every render, and not if it was already complete on load).
  const wasDone = useRef(allDone);
  useEffect(() => {
    if (allDone && !wasDone.current) celebrate();
    wasDone.current = allDone;
  }, [allDone]);

  return (
    <div className="w-full rounded-2xl shadow-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className={[
          'w-full flex items-center gap-3 p-4 text-left transition-colors',
          allDone ? 'bg-green-400' : 'bg-purple-100 hover:bg-purple-200',
        ].join(' ')}
      >
        <span className="text-3xl leading-none">{section.emoji}</span>
        <span className={`flex-1 text-xl font-black ${allDone ? 'text-white' : 'text-purple-700'}`}>
          {section.title}
        </span>
        <span
          className={`text-sm font-black px-2 py-1 rounded-full ${
            allDone ? 'bg-white/30 text-white' : 'bg-white text-purple-600'
          }`}
        >
          {allDone ? '✓ Done!' : `${done}/${total}`}
        </span>
        <span
          className={`text-2xl transition-transform duration-300 ${open ? 'rotate-180' : ''} ${
            allDone ? 'text-white' : 'text-purple-500'
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="p-3 space-y-3 bg-white/60">
          {section.tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              done={completedToday.includes(task.id)}
              onToggle={() => onToggleTask(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
