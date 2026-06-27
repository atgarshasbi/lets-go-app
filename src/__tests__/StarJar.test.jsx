import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StarJar from '../components/StarJar';
import { SoundContext } from '../theme';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

function renderJar({ totalStars = 0, soundEnabled = true, onBonusStar = vi.fn() } = {}) {
  return render(
    <SoundContext.Provider value={soundEnabled}>
      <StarJar totalStars={totalStars} onBonusStar={onBonusStar} />
    </SoundContext.Provider>
  );
}

describe('StarJar — rendering', () => {
  it('displays the current star count', () => {
    renderJar({ totalStars: 5 });
    expect(screen.getByText(/5 ⭐/)).toBeInTheDocument();
  });

  it('shows 0 stars initially', () => {
    renderJar({ totalStars: 0 });
    expect(screen.getByText(/0 ⭐/)).toBeInTheDocument();
  });

  it('shows the Bonus! label', () => {
    renderJar();
    expect(screen.getByText('Bonus!')).toBeInTheDocument();
  });

  it('shows "+N more" overflow text when stars exceed 12', () => {
    renderJar({ totalStars: 15 });
    expect(screen.getByText('+3 more')).toBeInTheDocument();
  });
});

describe('StarJar — bonus button', () => {
  it('calls onBonusStar when the bonus button is clicked', () => {
    const onBonusStar = vi.fn();
    renderJar({ onBonusStar });
    fireEvent.click(screen.getByTitle(/bonus star/i));
    expect(onBonusStar).toHaveBeenCalledOnce();
  });

  it('fires confetti when the bonus button is clicked', async () => {
    const confetti = (await import('canvas-confetti')).default;
    confetti.mockClear();
    renderJar();
    fireEvent.click(screen.getByTitle(/bonus star/i));
    expect(confetti).toHaveBeenCalled();
  });
});

describe('StarJar — sound gating', () => {
  it('calls createOscillator (coin sound) when sound is enabled', () => {
    global.__audioCtx()?.createOscillator.mockClear();
    renderJar({ soundEnabled: true });
    fireEvent.click(screen.getByTitle(/bonus star/i));
    expect(global.__audioCtx()?.createOscillator).toHaveBeenCalled();
  });

  it('does not call createOscillator when sound is disabled', () => {
    global.__audioCtx()?.createOscillator.mockClear();
    renderJar({ soundEnabled: false });
    fireEvent.click(screen.getByTitle(/bonus star/i));
    expect(global.__audioCtx()?.createOscillator).not.toHaveBeenCalled();
  });
});
