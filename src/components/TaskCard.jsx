import { useState } from 'react';
import confetti from 'canvas-confetti';
import { useSound } from '../theme';

const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bd6'];

// Short, high-energy phrases a 3-year-old will love to hear. Each is both
// shown on screen and spoken out loud.
const PRAISES = [
  'Yaaay!', 'Woohoo!', 'You did it!', 'Great job!', 'Amazing!',
  'Super star!', 'High five!', 'Hooray!', 'Way to go!', 'Fantastic!',
  'You rock!', 'Wonderful!', 'Awesome!', 'So proud of you!',
];

function randomPraise() {
  return PRAISES[Math.floor(Math.random() * PRAISES.length)];
}

// Pick the warmest, most natural-sounding English voice the device offers,
// instead of the robotic default. Prefers modern "natural" voices, then
// well-known friendly female voices.
let cachedVoice = null;
function pickVoice() {
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices();
  if (!voices.length) return null;
  const en = voices.filter(v => /^en/i.test(v.lang));
  const pool = en.length ? en : voices;
  const prefer = [
    /natural/i, /aria/i, /jenny/i, /ava/i, /libby/i, /sonia/i, // modern MS natural voices
    /google us english/i, /samantha/i, /zira/i, /female/i,
  ];
  for (const re of prefer) {
    const match = pool.find(v => re.test(v.name));
    if (match) return match;
  }
  return pool[0];
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  // Voices load asynchronously in some browsers.
  cachedVoice = pickVoice();
  window.speechSynthesis.onvoiceschanged = () => { cachedVoice = pickVoice(); };
}

// Speak the praise with lots of energy — a bright, bouncy delivery.
function speak(text) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel(); // avoid overlap if taps come fast
    if (!cachedVoice) cachedVoice = pickVoice();
    const u = new SpeechSynthesisUtterance(text);
    if (cachedVoice) u.voice = cachedVoice;
    u.lang = (cachedVoice && cachedVoice.lang) || 'en-US';
    u.rate = 1.1;   // a touch quick = excited
    u.pitch = 1.6;  // bright and cheerful
    u.volume = 1;
    synth.speak(u);
  } catch {
    // ignore — voice is a nice-to-have
  }
}

// A short, cheerful ascending chime synthesized with the Web Audio API,
// so there's no audio file to ship and it works offline. Reuses one
// AudioContext across taps.
let audioCtx = null;
function playChime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = now + i * 0.07;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch {
    // ignore — sound is a nice-to-have
  }
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
        playChime();
        const phrase = randomPraise();
        setPraise(phrase);
        speak(phrase);
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
          ? 'bg-green-400 border-4 border-green-500'
          : 'bg-white border-4 border-purple-200 hover:border-purple-400 hover:shadow-xl',
      ].join(' ')}
    >
      {praise && (
        <span className="pointer-events-none absolute left-1/2 top-1 z-20 animate-float-up whitespace-nowrap text-3xl font-black text-pink-500 drop-shadow-lg">
          {praise} 🎉
        </span>
      )}

      <span className="text-5xl leading-none">{task.emoji}</span>
      <span className={`flex-1 text-2xl font-black ${done ? 'text-white line-through' : 'text-gray-700'}`}>
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
