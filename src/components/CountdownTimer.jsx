import { useState, useEffect, useRef } from 'react';

const STEP_SEC = 10;  // the slider snaps to 10-second steps
const MIN_SEC = 10;

function snap(sec, lo, hi) {
  const s = Math.round(sec / STEP_SEC) * STEP_SEC;
  return Math.min(hi, Math.max(lo, s));
}

function fmt(sec) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export default function CountdownTimer({ minutes, setMinutes, maxMinutes = 3, running, resetToken }) {
  const maxSec = Math.max(MIN_SEC, Math.round(maxMinutes * 60));
  // Clamp/snap the saved time to [10s .. max], in 10-second steps.
  const totalSeconds = snap(Math.round((Number(minutes) || 0) * 60), MIN_SEC, maxSec);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);

  // Refill whenever the length changes or progress is reset.
  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds, resetToken]);

  // Tick down once per second while running (paused while dragging the handle).
  useEffect(() => {
    if (!running || dragging) return;
    const id = setInterval(() => {
      setRemaining(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running, resetToken, totalSeconds, dragging]);

  const done = remaining === 0;
  // The emoji sits at the amount of time LEFT, on a 0..max-min track.
  // It travels left as the timer counts down; drag it right to add time.
  const pos = Math.min(1, remaining / maxSec);
  const timePct = totalSeconds > 0 ? remaining / totalSeconds : 0;

  const color = done ? '#a855f7' : timePct > 0.5 ? '#22c55e' : timePct > 0.2 ? '#fbbf24' : '#fb7185';
  const face = done ? '🎉' : timePct > 0.5 ? '😃' : timePct > 0.2 ? '🙂' : '⏳';

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;

  function setFromClientX(clientX) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let r = (clientX - rect.left) / rect.width;
    r = Math.min(1, Math.max(0, r));
    // Map the handle position to a new timer length, snapped to 10 seconds.
    setMinutes(snap(r * maxSec, MIN_SEC, maxSec) / 60);
  }

  function onPointerDown(e) {
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  }
  function onPointerMove(e) {
    if (dragging) setFromClientX(e.clientX);
  }
  function onPointerUp(e) {
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  return (
    <div className="w-full max-w-md mb-3 px-2 select-none">
      <div className="flex items-end justify-between mb-1">
        <span className="text-sm font-black text-gray-500">⏰ Time left</span>
        <span className="text-2xl font-black tabular-nums" style={{ color }}>
          {done ? 'Done!' : timeStr}
        </span>
      </div>

      {/* Slide bar — the emoji shows time left; drag it RIGHT to add more time */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative h-12 cursor-pointer touch-none"
      >
        {/* full track (empty room to the right = time you can add) */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-4 rounded-full bg-purple-100" />
        {/* time-left fill, from the left up to the emoji */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-4 rounded-full"
          style={{ width: `${pos * 100}%`, backgroundColor: color, transition: dragging ? 'none' : 'width 1s linear, background-color 0.4s' }}
        />
        {/* emoji handle */}
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
        {done ? "Time's up — you're a star! 🌟" : `Drag the face right for more time • ${fmt(totalSeconds)}`}
      </p>
    </div>
  );
}
