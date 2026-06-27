import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// ── Web Audio API (jsdom doesn't implement it) ──────────────────────────────
const makeGain = () => ({
  connect: vi.fn(),
  gain: {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
});

const makeOscillator = () => ({
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  type: 'sine',
  frequency: { value: 440, setValueAtTime: vi.fn() },
});

const makeBufferSource = () => ({
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  buffer: null,
});

const makeFilter = () => ({
  connect: vi.fn(),
  type: 'lowpass',
  frequency: { value: 350 },
  Q: { value: 1 },
});

global.AudioContext = vi.fn(() => ({
  createOscillator: vi.fn(makeOscillator),
  createGain: vi.fn(makeGain),
  createBiquadFilter: vi.fn(makeFilter),
  createBuffer: vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(1024)),
  })),
  createBufferSource: vi.fn(makeBufferSource),
  currentTime: 0,
  sampleRate: 44100,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  destination: {},
}));
global.webkitAudioContext = global.AudioContext;

// ── Speech Synthesis ────────────────────────────────────────────────────────
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => []),
  onvoiceschanged: null,
};
global.SpeechSynthesisUtterance = vi.fn();

// ── Animation frame (used by confetti) ─────────────────────────────────────
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn(id => clearTimeout(id));

// ── Clear localStorage between tests ───────────────────────────────────────
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
