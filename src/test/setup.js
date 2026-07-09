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
  frequency: { value: 440, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
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
  frequency: { value: 350, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  Q: { value: 1 },
});

// Modules cache the AudioContext instance, so new AudioContext() is only called once.
// We keep a persistent reference so tests can check method calls even after vi.clearAllMocks().
let _audioCtxInstance = null;
global.AudioContext = vi.fn(() => {
  if (!_audioCtxInstance) {
    _audioCtxInstance = {
      createOscillator: vi.fn(makeOscillator),
      createGain: vi.fn(makeGain),
      createBiquadFilter: vi.fn(makeFilter),
      createBuffer: vi.fn(() => ({ getChannelData: vi.fn(() => new Float32Array(1024)) })),
      createBufferSource: vi.fn(makeBufferSource),
      currentTime: 0,
      sampleRate: 44100,
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined),
      destination: {},
    };
  }
  return _audioCtxInstance;
});
global.webkitAudioContext = global.AudioContext;
// Expose getter so tests can check createOscillator etc. on the cached instance
global.__audioCtx = () => _audioCtxInstance;

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
