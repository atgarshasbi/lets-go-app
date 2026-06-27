import { useState, useEffect, useRef } from 'react';

const STEP_SEC = 10;  // the slider snaps to 10-second steps
const MIN_SEC = 10;
const ALERT_SEC = 20;

function snap(sec, lo, hi) {
  const s = Math.round(sec / STEP_SEC) * STEP_SEC;
  return Math.min(hi, Math.max(lo, s));
}

function fmt(sec) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

function playBeep(audioCtx, frequency = 880) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (_) {}
}

// Smooth hourglass using cubic bezier curves so the sides curve organically.
// progress: 0 = top full / bottom empty, 1 = top empty / bottom full.
function Hourglass({ progress, alerting, done, ticking }) {
  const cx = 55, W = 110;
  const topY = 15, midY = 83, bottomY = 155;
  const r = 44, neckR = 5;
  // Control point y-offset: half the distance between top/mid rows
  const h = (midY - topY) / 2; // 34

  // Sand levels
  const topSandY  = topY  + progress * (midY - topY);
  const topSandH  = Math.max(0, midY - topSandY);
  const botSandH  = Math.max(0, progress * (bottomY - midY));
  const botSandY  = bottomY - botSandH;

  const sandColor  = done ? '#a855f7' : alerting ? '#ef4444' : '#f59e0b';
  const frameColor = alerting ? '#dc2626' : '#92400e';
  const glassStroke = alerting ? '#fca5a5' : '#93c5fd';
  const glassFill   = alerting ? 'rgba(254,202,202,0.2)' : 'rgba(219,234,254,0.22)';

  // Full hourglass outline (cubic beziers give smooth inward curves at the neck)
  const outline = `
    M${cx - r},${topY} L${cx + r},${topY}
    C${cx + r},${topY + h} ${cx + neckR},${midY - h} ${cx + neckR},${midY}
    C${cx + neckR},${midY + h} ${cx + r},${bottomY - h} ${cx + r},${bottomY}
    L${cx - r},${bottomY}
    C${cx - r},${bottomY - h} ${cx - neckR},${midY + h} ${cx - neckR},${midY}
    C${cx - neckR},${midY - h} ${cx - r},${topY + h} ${cx - r},${topY}
    Z`;

  // Clip regions: top half and bottom half of the hourglass
  const topHalf = `
    M${cx - r},${topY} L${cx + r},${topY}
    C${cx + r},${topY + h} ${cx + neckR},${midY - h} ${cx + neckR},${midY}
    L${cx - neckR},${midY}
    C${cx - neckR},${midY - h} ${cx - r},${topY + h} ${cx - r},${topY}
    Z`;

  const botHalf = `
    M${cx - neckR},${midY} L${cx + neckR},${midY}
    C${cx + neckR},${midY + h} ${cx + r},${bottomY - h} ${cx + r},${bottomY}
    L${cx - r},${bottomY}
    C${cx - r},${bottomY - h} ${cx - neckR},${midY + h} ${cx - neckR},${midY}
    Z`;

  const showParticles = ticking && progress > 0.02 && progress < 0.98;

  return (
    <svg width={W} height={170} viewBox={`0 0 ${W} 170`}>
      <defs>
        <clipPath id="hg-top"><path d={topHalf} /></clipPath>
        <clipPath id="hg-bot"><path d={botHalf} /></clipPath>
      </defs>

      {/* Top frame bar */}
      <rect x={cx - r - 3} y={topY - 11} width={(r + 3) * 2} height={11} rx={5} fill={frameColor} />

      {/* Glass shell */}
      <path d={outline} fill={glassFill} stroke={glassStroke} strokeWidth="2" />

      {/* Top sand (drains downward as progress grows) */}
      <g clipPath="url(#hg-top)">
        <rect x={0} y={topSandY} width={W} height={topSandH} fill={sandColor} />
      </g>

      {/* Falling sand particles through the neck */}
      {showParticles && [-2, 0, 2].map((ox, i) => (
        <circle key={i} cx={cx + ox} r={1.6} fill={sandColor}>
          <animate attributeName="cy" from={`${midY}`} to={`${midY + 26}`}
            dur={`${0.4 + i * 0.12}s`} begin={`${i * 0.11}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" from="1" to="0"
            dur={`${0.4 + i * 0.12}s`} begin={`${i * 0.11}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Bottom sand (fills upward as progress grows) */}
      <g clipPath="url(#hg-bot)">
        <rect x={0} y={botSandY} width={W} height={botSandH} fill={sandColor} />
      </g>

      {/* Bottom frame bar */}
      <rect x={cx - r - 3} y={bottomY} width={(r + 3) * 2} height={11} rx={5} fill={frameColor} />
    </svg>
  );
}

export default function CountdownTimer({ minutes, setMinutes, maxMinutes = 3, running, resetToken, onStart }) {
  const maxSec = Math.max(MIN_SEC, Math.round(maxMinutes * 60));
  const totalSeconds = snap(Math.round((Number(minutes) || 0) * 60), MIN_SEC, maxSec);

  const [remaining, setRemaining] = useState(totalSeconds);
  const [started, setStarted]     = useState(false);
  const [dragging, setDragging]   = useState(false);
  const trackRef    = useRef(null);
  const audioCtxRef = useRef(null);

  // Refill and reset started whenever the timer config or reset token changes.
  useEffect(() => {
    setRemaining(totalSeconds);
    setStarted(false);
  }, [totalSeconds, resetToken]);

  // Tick — same dep pattern as the original, plus `started`.
  useEffect(() => {
    if (!started || !running || dragging) return;
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) return 0;
        const next = prev - 1;
        if (next <= ALERT_SEC) {
          playBeep(audioCtxRef.current, next <= 10 ? 1046 : 880);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, running, dragging, resetToken, totalSeconds]);

  function handleStartPause() {
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
    }
    if (!started) onStart?.();
    setStarted(s => !s);
  }

  const done    = remaining === 0;
  const ticking = started && running && !done;
  const alerting = ticking && remaining <= ALERT_SEC;

  const pos     = Math.min(1, remaining / maxSec);
  const timePct = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const progress = totalSeconds > 0 ? 1 - remaining / totalSeconds : done ? 1 : 0;

  const color = done      ? '#a855f7'
              : alerting  ? '#ef4444'
              : timePct > 0.5 ? '#22c55e'
              : timePct > 0.2 ? '#fbbf24'
              : '#fb7185';

  const face  = done ? '🎉' : alerting ? '😱' : timePct > 0.5 ? '😃' : timePct > 0.2 ? '🙂' : '⏳';
  const timeStr = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;

  function setFromClientX(clientX) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let r2 = (clientX - rect.left) / rect.width;
    r2 = Math.min(1, Math.max(0, r2));
    setMinutes(snap(r2 * maxSec, MIN_SEC, maxSec) / 60);
  }

  function onPointerDown(e) {
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  }
  function onPointerMove(e) { if (dragging) setFromClientX(e.clientX); }
  function onPointerUp(e) {
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  return (
    <div className="w-full max-w-md mb-3 px-2 select-none">
      {/* Header */}
      <div className="flex items-end justify-between mb-1">
        <span className="text-sm font-black text-gray-500">⏰ Time left</span>
        <span
          className={`text-2xl font-black tabular-nums${alerting ? ' alarm-blink' : ''}`}
          style={{ color }}
        >
          {done ? 'Done!' : timeStr}
        </span>
      </div>

      {/* Hourglass */}
      <div className={`flex justify-center my-2${alerting ? ' alarm-glow' : ''}`}>
        <Hourglass progress={progress} alerting={alerting} done={done} ticking={ticking} />
      </div>

      {/* Start / Pause button */}
      {!done && (
        <div className="flex justify-center mb-3">
          <button
            onClick={handleStartPause}
            style={{ minWidth: 130 }}
            className={`font-black text-xl text-white py-3 px-8 rounded-full shadow-lg active:scale-95 transition-all duration-150 ${
              ticking ? 'bg-amber-400 hover:bg-amber-500' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {ticking ? '⏸ Pause' : started ? '▶ Resume' : '▶ Start!'}
          </button>
        </div>
      )}

      {/* Slide bar — the emoji shows time left; drag it RIGHT to add more time */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative h-12 cursor-pointer touch-none"
      >
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-4 rounded-full bg-purple-100" />
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-4 rounded-full"
          style={{ width: `${pos * 100}%`, backgroundColor: color, transition: dragging ? 'none' : 'width 1s linear, background-color 0.4s' }}
        />
        <div
          className="absolute top-1/2 flex items-center justify-center rounded-full bg-white shadow-lg border-4"
          style={{
            left: `${pos * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: 52,
            height: 52,
            borderColor: color,
            transition: dragging ? 'none' : 'left 1s linear, border-color 0.4s',
          }}
        >
          <span key={face} className="text-3xl leading-none animate-bounce-in">{face}</span>
        </div>
      </div>

      <p className="mt-1 text-center text-sm font-black" style={{ color }}>
        {done
          ? "Time's up — you're a star! 🌟"
          : alerting
          ? '⚡ Quick quick quick! ⚡'
          : `Drag the face right for more time • ${fmt(totalSeconds)}`}
      </p>
    </div>
  );
}
