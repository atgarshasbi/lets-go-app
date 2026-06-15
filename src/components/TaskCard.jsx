import { useState } from 'react';

export default function TaskCard({ task, done, onToggle }) {
  const [popping, setPopping] = useState(false);

  function handleClick() {
    setPopping(true);
    setTimeout(() => setPopping(false), 300);
    onToggle();
  }

  return (
    <button
      onClick={handleClick}
      className={[
        'w-full flex items-center gap-4 p-4 rounded-2xl shadow-lg text-left',
        'transition-all duration-300 select-none active:scale-95 cursor-pointer',
        popping ? 'animate-check-pop' : '',
        done
          ? 'bg-green-400 border-4 border-green-500'
          : 'bg-white border-4 border-purple-200 hover:border-purple-400 hover:shadow-xl',
      ].join(' ')}
    >
      <span className="text-5xl leading-none">{task.emoji}</span>
      <span className={`flex-1 text-2xl font-black ${done ? 'text-white line-through' : 'text-gray-700'}`}>
        {task.label}
      </span>
      <span className="text-4xl">{done ? '✅' : '⭕'}</span>
    </button>
  );
}
