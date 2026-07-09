import { useState, useEffect, useRef } from 'react';

// ── Creature stages — driven by TASK completion %, not the clock ──────────
const STAGES = [
  { at: 0,    emoji: '😴', label: 'Zzzz… wake me up!',      cls: 'creature-sleep'  },
  { at: 0.01, emoji: '🥱', label: 'Yawning… keep going!',   cls: 'creature-yawn'   },
  { at: 0.26, emoji: '😊', label: 'Getting warmed up!',     cls: 'creature-sit'    },
  { at: 0.51, emoji: '😄', label: 'Halfway there, woohoo!', cls: 'creature-happy'  },
  { at: 0.76, emoji: '🤩', label: 'So close, keep going!!', cls: 'creature-bounce' },
];
const DONE_STAGE = { emoji: '🥳', label: "You're amazing!!", cls: 'creature-celebrate' };

function getStage(pct, allTasksDone) {
  if (allTasksDone) return DONE_STAGE;
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (pct >= STAGES[i].at) return STAGES[i];
  }
  return STAGES[0];
}

// ── Ring geometry ─────────────────────────────────────────────────────────
const CX = 100, CY = 100, R = 80, SW = 15;
const CIRC = 2 * Math.PI * R;

// ── Audio helpers ─────────────────────────────────────────────────────────
function playBeep(ctx, freq = 880) {
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

// Stadium air horn: a held sawtooth chord that blasts for ~2s then fades out.
function playStadiumHorn(ctx) {
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    // Root + fifth + octave gives a full, horn-like chord
    [233, 349, 466].forEach((freq, i) => {
      const vol = [0.42, 0.22, 0.18][i];
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.07); // fast attack
      gain.gain.setValueAtTime(vol, now + 2.0);           // hold
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8); // slow fade
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.9);
    });
  } catch (_) {}
}

export default function CreatureTimer({
  minutes, setMinutes, maxMinutes = 30, running, resetToken, completionPct,
}) {
  const totalSec = Math.max(10, Math.round((Number(minutes) || 0) * 60));

  const [remaining, setRemaining] = useState(totalSec);
  const [started,   setStarted]   = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [editM,     setEditM]     = useState(Math.floor(totalSec / 60));
  const [editS,     setEditS]     = useState(totalSec % 60);
  const audioCtxRef = useRef(null);

  // Reset when timer config or resetToken changes
  useEffect(() => {
    setRemaining(totalSec);
    setStarted(false);
    setEditing(false);
  }, [totalSec, resetToken]);

  // Tick + sounds — minimal deps
  useEffect(() => {
    if (!started || !running) return;
    const id = setInterval(() => {
      setRemaining(prev => {
        const next = prev <= 1 ? 0 : prev - 1;
        const ctx = audioCtxRef.current;
        if (next === 0 && prev > 0) playStadiumHorn(ctx);
        else if (next > 0 && next <= 20) playBeep(ctx, next <= 10 ? 1046 : 880);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, running]);

  function handleStart() {
    // Init AudioContext on first user gesture so sounds work
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
    }
    setStarted(s => !s);
  }

  function restart() {
    setRemaining(totalSec);
    setStarted(false);
  }

  function openEdit() {
    if (started) return;
    setEditM(Math.floor(remaining / 60));
    setEditS(remaining % 60);
    setEditing(true);
  }

  function confirmEdit() {
    const secs = Math.max(10, editM * 60 + editS);
    setMinutes(secs / 60);
    setEditing(false);
  }

  function clampM(v) { return Math.min(maxMinutes, Math.max(0, v)); }
  function clampS(v) { return Math.min(55, Math.max(0, v)); }

  const timerDone   = remaining === 0;
  const allTasksDone = completionPct >= 1;
  const ticking     = started && running && !timerDone;

  const progress   = totalSec > 0 ? remaining / totalSec : 0;
  const dashOffset = CIRC * (1 - progress);

  const stage    = getStage(completionPct, allTasksDone);
  const sleeping = completionPct === 0 && !allTasksDone;

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const ringColor = timerDone ? '#a855f7' : '#818cf8';

  return (
    <div className="w-full max-w-md mb-4 px-2 select-none flex flex-col items-center">

      {/* ── Creature ── */}
      <div className="relative flex flex-col items-center mb-3">
        {sleeping && (
          <div className="pointer-events-none" style={{ position: 'absolute', top: -8, right: '26%' }}>
            <span className="zzz-float" style={{ '--d': '0s',   fontSize: 13, color: '#93c5fd', position: 'absolute' }}>z</span>
            <span className="zzz-float" style={{ '--d': '0.7s', fontSize: 17, color: '#60a5fa', position: 'absolute', left: 8 }}>z</span>
            <span className="zzz-float" style={{ '--d': '1.4s', fontSize: 22, color: '#3b82f6', position: 'absolute', left: 18 }}>Z</span>
          </div>
        )}
        <span className={`text-8xl leading-none ${stage.cls}`} key={stage.emoji}>
          {stage.emoji}
        </span>
        <p className="mt-2 text-base font-black text-purple-600">{stage.label}</p>
      </div>

      {/* ── Circular ring ── */}
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e9d5ff" strokeWidth={SW} />
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{ transition: ticking ? 'stroke-dashoffset 1s linear' : 'none' }}
          />
        </svg>

        <div style={{ position: 'absolute', inset: 0 }} className="flex flex-col items-center justify-center">
          {timerDone ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-black text-purple-500">Time&apos;s up!</span>
              <button
                onClick={restart}
                className="mt-1 text-sm font-black text-white bg-purple-400 hover:bg-purple-500 active:scale-90 rounded-full px-4 py-1.5 transition"
              >
                🔄 Restart
              </button>
            </div>
          ) : (
            <button
              onClick={openEdit}
              disabled={started}
              className="flex flex-col items-center active:scale-95 transition-transform"
            >
              <span className="text-5xl font-black tabular-nums" style={{ color: ringColor }}>
                {mm}:{ss}
              </span>
              {!started && (
                <span className="text-xs font-bold text-purple-300 mt-1">tap to set</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Time picker (Android-style, shows below ring) ── */}
      {editing && (
        <div className="flex items-center gap-3 mt-3 bg-white rounded-2xl shadow-lg px-5 py-3 border-2 border-purple-100">
          <div className="flex flex-col items-center gap-1">
            <button onClick={() => setEditM(m => clampM(m + 1))}
              className="text-purple-500 font-black text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-purple-50 active:scale-90">▲</button>
            <span className="text-4xl font-black text-gray-800 w-14 text-center tabular-nums">
              {String(editM).padStart(2, '0')}
            </span>
            <button onClick={() => setEditM(m => clampM(m - 1))}
              className="text-purple-500 font-black text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-purple-50 active:scale-90">▼</button>
            <span className="text-xs font-bold text-gray-400">min</span>
          </div>

          <span className="text-4xl font-black text-gray-400 mb-5">:</span>

          <div className="flex flex-col items-center gap-1">
            <button onClick={() => setEditS(s => clampS(s >= 55 ? 55 : s + 5))}
              className="text-purple-500 font-black text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-purple-50 active:scale-90">▲</button>
            <span className="text-4xl font-black text-gray-800 w-14 text-center tabular-nums">
              {String(editS).padStart(2, '0')}
            </span>
            <button onClick={() => setEditS(s => clampS(s <= 0 ? 0 : s - 5))}
              className="text-purple-500 font-black text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-purple-50 active:scale-90">▼</button>
            <span className="text-xs font-bold text-gray-400">sec</span>
          </div>

          <button onClick={confirmEdit}
            className="ml-2 mb-5 bg-purple-500 hover:bg-purple-600 active:scale-90 text-white font-black text-lg w-11 h-11 rounded-full flex items-center justify-center shadow transition">
            ✓
          </button>
        </div>
      )}

      {/* ── Start / Pause — hidden when timer has run out ── */}
      {!timerDone && (
        <button
          onClick={handleStart}
          style={{ minWidth: 130 }}
          className={`mt-4 font-black text-xl text-white py-3 px-10 rounded-full shadow-lg active:scale-95 transition-all duration-150 ${
            ticking ? 'bg-amber-400 hover:bg-amber-500' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {ticking ? '⏸ Pause' : started ? '▶ Resume' : '▶ Start!'}
        </button>
      )}
    </div>
  );
}
