import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CHARACTERS, useSound } from '../theme';

let celebCtx = null;
function getCelebCtx() {
  if (!celebCtx) celebCtx = new (window.AudioContext || window.webkitAudioContext)();
  return celebCtx;
}

function playCelebrationSound() {
  try {
    const ctx = getCelebCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    // Crowd noise — bandpass-filtered white noise that swells in
    const bufferSize = Math.floor(ctx.sampleRate * 3.5);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.14, now + 0.5);
    noiseGain.gain.linearRampToValueAtTime(0.10, now + 3);
    noiseGain.gain.linearRampToValueAtTime(0, now + 3.5);
    noise.connect(bp);
    bp.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 3.5);

    // Ascending fanfare — triumphant major arpeggio
    [
      { freq: 523,  t: 0,    dur: 0.55 },  // C5
      { freq: 659,  t: 0.13, dur: 0.55 },  // E5
      { freq: 784,  t: 0.26, dur: 0.55 },  // G5
      { freq: 1047, t: 0.39, dur: 0.8  },  // C6
      { freq: 1319, t: 0.55, dur: 0.8  },  // E6
      { freq: 1047, t: 0.9,  dur: 0.4  },  // C6 echo
      { freq: 1568, t: 1.15, dur: 1.2  },  // G6 triumphant hold
    ].forEach(({ freq, t, dur }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now + t);
      g.gain.linearRampToValueAtTime(0.18, now + t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, now + t + dur);
      osc.start(now + t);
      osc.stop(now + t + dur + 0.05);
    });
  } catch (_) {}
}

export default function CelebrationScreen({ childName, starsEarned, onClose, celebrationCharacter = 'trophy' }) {
  const soundEnabled = useSound();

  useEffect(() => {
    const end = Date.now() + 4000;
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bd6'];
    function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }
    frame();

    if (soundEnabled) playCelebrationSound();
  }, []);

  const character = CHARACTERS[celebrationCharacter] || CHARACTERS.trophy;
  const starCount = Math.min(starsEarned, 10);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-pink-300 via-yellow-200 to-purple-300 p-6">
      <div className="text-8xl mb-4" style={{ animation: 'bounceIn 0.6s ease-out both' }}>
        {character.emoji}
      </div>

      <h1
        className="text-5xl font-black text-purple-700 text-center drop-shadow-lg mb-2"
        style={{ animation: 'bounceIn 0.6s ease-out 0.2s both' }}
      >
        YOU DID IT!
      </h1>

      <p
        className="text-2xl font-bold text-pink-600 mb-6 text-center"
        style={{ animation: 'bounceIn 0.6s ease-out 0.4s both' }}
      >
        {childName}, you&apos;re amazing! 🎉
      </p>

      <div className="flex flex-wrap justify-center gap-1 mb-6">
        {Array.from({ length: starCount }).map((_, i) => (
          <span
            key={i}
            className="text-4xl"
            style={{ animation: `bounceIn 0.5s ease-out ${0.5 + i * 0.1}s both`, display: 'inline-block' }}
          >
            ⭐
          </span>
        ))}
      </div>

      <p
        className="text-2xl font-black text-yellow-600 mb-8"
        style={{ animation: `bounceIn 0.5s ease-out ${0.5 + starCount * 0.1}s both` }}
      >
        {starsEarned} stars earned! 🌟
      </p>

      <button
        onClick={onClose}
        className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xl font-black py-4 px-10 rounded-full shadow-xl transition"
        style={{ animation: `bounceIn 0.5s ease-out ${0.7 + starCount * 0.1}s both` }}
      >
        Done! 🎊
      </button>
    </div>
  );
}
