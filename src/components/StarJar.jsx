import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useSound } from '../theme';

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playCoinSound() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    // Three quick metallic pings — stable pitch, fast decay, no frequency sweep
    [
      { freq: 2400, delay: 0    },
      { freq: 2800, delay: 0.09 },
      { freq: 2200, delay: 0.18 },
    ].forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle'; // triangle adds metallic overtones vs pure sine
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + delay + 0.002); // instant attack
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.07); // fast decay
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.08);
    });
  } catch (_) {}
}

const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bd6'];
const MAX_VISIBLE = 12;

// Fixed pile positions — stars tumble in from the bottom up, slightly offset and rotated
const PILE = [
  { left:  8, top: 122, rot: -8  },
  { left: 30, top: 126, rot:  5  },
  { left: 52, top: 120, rot: -3  },
  { left: 70, top: 124, rot: 10  },
  { left: 15, top: 100, rot:  6  },
  { left: 38, top: 104, rot: -12 },
  { left: 58, top:  98, rot:  4  },
  { left: 74, top: 102, rot: -7  },
  { left: 22, top:  78, rot: -5  },
  { left: 44, top:  82, rot:  9  },
  { left: 63, top:  76, rot: -11 },
  { left: 78, top:  80, rot:  3  },
];

export default function StarJar({ totalStars, onBonusStar }) {
  const soundEnabled = useSound();
  const [bouncing, setBouncing] = useState(false);
  const prevRef = useRef(totalStars);

  // Bounce the jar whenever the count goes up
  useEffect(() => {
    if (totalStars > prevRef.current) {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 650);
    }
    prevRef.current = totalStars;
  }, [totalStars]);

  function handleBonus(e) {
    if (soundEnabled) playCoinSound();
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 65,
      spread: 75,
      startVelocity: 38,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: rect.top / window.innerHeight,
      },
      colors: CONFETTI_COLORS,
    });
    onBonusStar();
  }

  const visible  = Math.min(totalStars, MAX_VISIBLE);
  const overflow = totalStars > MAX_VISIBLE ? totalStars - MAX_VISIBLE : 0;

  return (
    <div className="flex items-end justify-center gap-4 py-4 pb-20">

      {/* ── Jar ── */}
      <div className={bouncing ? 'jar-bounce' : ''} style={{ position: 'relative', width: 110, height: 155 }}>

        {/* SVG jar shell */}
        <svg width="110" height="155" viewBox="0 0 110 155" style={{ position: 'absolute', inset: 0 }}>
          {/* Lid knob */}
          <rect x="46" y="2" width="18" height="9" rx="4" fill="#78716c" />
          {/* Lid brim */}
          <rect x="24" y="10" width="62" height="13" rx="4" fill="#92400e" />
          {/* Jar body */}
          <rect x="11" y="21" width="88" height="126" rx="18"
            fill="rgba(219,234,254,0.45)" stroke="#93c5fd" strokeWidth="3" />
          {/* Glass shine */}
          <rect x="19" y="32" width="9" height="52" rx="4" fill="rgba(255,255,255,0.38)" />
          {/* Overflow text */}
          {overflow > 0 && (
            <text x="55" y="46" textAnchor="middle" fontSize="13"
              fontWeight="bold" fill="#7c3aed" fontFamily="sans-serif">
              +{overflow} more
            </text>
          )}
        </svg>

        {/* Star emojis — absolutely placed so they sit inside the jar */}
        {Array.from({ length: visible }, (_, i) => {
          const { left, top, rot } = PILE[i];
          const isNewest = i === visible - 1;
          return (
            <span
              key={`${i}-${totalStars}`}
              className={`select-none${isNewest && bouncing ? ' star-drop' : ''}`}
              style={{
                position: 'absolute',
                left,
                top,
                fontSize: 18,
                lineHeight: 1,
                transform: `rotate(${rot}deg)`,
              }}
            >
              ⭐
            </span>
          );
        })}
      </div>

      {/* ── Star count + bonus button ── */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <span className="text-2xl font-black text-purple-700 tabular-nums">
          {totalStars} ⭐
        </span>
        <button
          onClick={handleBonus}
          className="bg-yellow-300 hover:bg-yellow-400 active:scale-90 border-4 border-yellow-500 rounded-full w-16 h-16 text-3xl flex items-center justify-center shadow-lg transition-all duration-150"
          title="Give a bonus star!"
        >
          ⭐
        </button>
        <span className="text-xs font-black text-yellow-700 uppercase tracking-wide">Bonus!</span>
      </div>
    </div>
  );
}
