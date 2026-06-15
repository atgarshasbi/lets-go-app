import { useState, useEffect, useRef } from 'react';

const SIZE = 130;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CountdownTimer({ minutes, running, resetToken }) {
  const totalSeconds = minutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds, resetToken]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!running || remaining <= 0) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, resetToken]);

  const pct = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  const color = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f97316' : '#ef4444';

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center mb-2">
      <svg width={SIZE} height={SIZE}>
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none" stroke="#e5e7eb" strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none" stroke={color} strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
        <text
          x="50%" y="45%"
          textAnchor="middle" dominantBaseline="middle"
          fontSize="22" fontWeight="900"
          fill={color}
          fontFamily="Nunito, system-ui, sans-serif"
        >
          {timeStr}
        </text>
        <text
          x="50%" y="68%"
          textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="700"
          fill="#9ca3af"
          fontFamily="Nunito, system-ui, sans-serif"
        >
          {remaining === 0 ? "TIME'S UP!" : 'left'}
        </text>
      </svg>
      {remaining === 0 && (
        <p className="text-red-500 font-black text-sm -mt-1">Keep going! 💪</p>
      )}
    </div>
  );
}
