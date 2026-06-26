import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../theme';

export default function CelebrationScreen({ childName, starsEarned, onClose, celebrationCharacter = 'trophy' }) {
  useEffect(() => {
    const end = Date.now() + 4000;
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bd6'];

    function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }
    frame();
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
        +{starsEarned} stars earned! 🏆
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
