import { useState } from 'react';
import confetti from 'canvas-confetti';
import { useSound } from '../theme';

const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bd6'];

const PRAISES = [
  'Yaaay!', 'Woohoo!', 'You did it!', 'Great job!', 'Amazing!',
  'Super star!', 'High five!', 'Hooray!', 'Way to go!', 'Fantastic!',
  'You rock!', 'Wonderful!', 'Awesome!', 'So proud of you!',
];

function randomPraise() {
  return PRAISES[Math.floor(Math.random() * PRAISES.length)];
}

let audioCtx = null;
function playRobotBlip() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    [
      { start: 600,  end: 1200, t: 0    },
      { start: 1400, end: 700,  t: 0.11 },
      { start: 800,  end: 1600, t: 0.22 },
    ].forEach(({ start, end, t }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(start, now + t);
      osc.frequency.exponentialRampToValueAtTime(end, now + t + 0.09);
      gain.gain.setValueAtTime(0.13, now + t);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.11);
    });
  } catch { /* ignore */ }
}

export default function TaskCard({ task, done, onToggle }) {
  const soundEnabled = useSound();
  const [popping, setPopping] = useState(false);
  const [lit, setLit] = useState(false);
  const [praise, setPraise] = useState(null);

  function handleClick(e) {
    const willComplete = !done;

    if (willComplete) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.min((rect.right - 36) / window.innerWidth, 1);
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 35,
        spread: 55,
        startVelocity: 28,
        scalar: 0.85,
        ticks: 120,
        origin: { x, y },
        colors: CONFETTI_COLORS,
      });

      if (soundEnabled) {
        playRobotBlip();
        const phrase = randomPraise();
        setPraise(phrase);
        setTimeout(() => setPraise(null), 1200);
      }

      setLit(true);
      setTimeout(() => setLit(false), 500);
    }

    setPopping(true);
    setTimeout(() => setPopping(false), 300);
    onToggle();
  }

  return (
    <button
      onClick={handleClick}
      className={[
        'relative w-full flex items-center gap-4 p-4 rounded-2xl shadow-lg text-left',
        'transition-all duration-300 select-none active:scale-95 cursor-pointer',
        popping ? 'animate-check-pop' : '',
        done
          ? 'bg-green-400 dark:bg-green-800 border-4 border-green-500 dark:border-green-700'
          : 'bg-white dark:bg-slate-800 border-4 border-purple-200 dark:border-violet-900 hover:border-purple-400 dark:hover:border-violet-700 hover:shadow-xl',
      ].join(' ')}
    >
      {praise && (
        <span className="pointer-events-none absolute left-1/2 top-1 z-20 animate-float-up whitespace-nowrap text-3xl font-black text-pink-500 drop-shadow-lg">
          {praise} 🎉
        </span>
      )}

      <span className="text-5xl leading-none">{task.emoji}</span>
      <span className={`flex-1 text-2xl font-black ${done ? 'text-white line-through' : 'text-gray-700 dark:text-slate-100'}`}>
        {task.label}
      </span>
      <span
        className={[
          'text-4xl leading-none transition-all duration-300',
          done ? 'opacity-100' : 'opacity-25 grayscale',
          lit ? 'animate-star-pop' : '',
        ].join(' ')}
        style={done ? { filter: 'drop-shadow(0 0 7px #ffd54a)' } : undefined}
      >
        ⭐
      </span>
    </button>
  );
}
