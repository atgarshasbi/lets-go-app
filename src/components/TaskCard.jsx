import { useState } from 'react';
import confetti from 'canvas-confetti';
import { useSound } from '../theme';

const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bd6'];

// Short, high-energy phrases shown on screen when a task is completed.
const PRAISES = [
  'Yaaay!', 'Woohoo!', 'You did it!', 'Great job!', 'Amazing!',
  'Super star!', 'High five!', 'Hooray!', 'Way to go!', 'Fantastic!',
  'You rock!', 'Wonderful!', 'Awesome!', 'So proud of you!',
];

function randomPraise() {
  return PRAISES[Math.floor(Math.random() * PRAISES.length)];
}

// Android voice: sawtooth oscillator (buzzing "vocal cords") routed through two
// bandpass filters (formants F1 + F2). Amplitude is pulsed once per estimated
// syllable, and the formant frequencies cycle through vowel-like positions.
// Result: a fully synthesized electronic android voice — no human speech involved.
let audioCtx = null;
function playAndroidVoice(text) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    // Estimate syllable count from vowel clusters
    const syls = Math.max(2, (text.match(/[aeiouy]+/gi) || []).length);
    const sylDur = 0.14;
    const totalDur = syls * sylDur + 0.12;

    // Sawtooth carrier — the electronic "vocal cord" buzz
    const carrier = ctx.createOscillator();
    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(90, now);
    carrier.frequency.linearRampToValueAtTime(100, now + totalDur * 0.4);
    carrier.frequency.linearRampToValueAtTime(85, now + totalDur);

    // F1: low formant (jaw opening) 400–700 Hz
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.Q.value = 10;

    // F2: high formant (tongue position) 900–2200 Hz
    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.Q.value = 7;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);

    carrier.connect(f1);
    carrier.connect(f2);
    f1.connect(masterGain);
    f2.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Cycle vowel-like formant pairs across syllables
    const F1 = [500, 700, 400, 600, 450, 650];
    const F2 = [1500, 1000, 2200, 1300, 1900, 1100];

    for (let i = 0; i < syls; i++) {
      const t = now + i * sylDur;
      masterGain.gain.setValueAtTime(0, t);
      masterGain.gain.linearRampToValueAtTime(0.4, t + 0.006);
      masterGain.gain.setValueAtTime(0.38, t + 0.09);
      masterGain.gain.linearRampToValueAtTime(0, t + sylDur);
      f1.frequency.setValueAtTime(F1[i % F1.length], t);
      f2.frequency.setValueAtTime(F2[i % F2.length], t);
    }

    masterGain.gain.setValueAtTime(0, now + totalDur);
    carrier.start(now);
    carrier.stop(now + totalDur + 0.05);
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
        const phrase = randomPraise();
        setPraise(phrase);
        playAndroidVoice(phrase);
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
