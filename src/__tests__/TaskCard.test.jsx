import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../components/TaskCard';
import { SoundContext } from '../theme';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const TASK = { id: 'task-1', emoji: '🪥', label: 'Brush Teeth' };

function renderCard({ done = false, soundEnabled = true, onToggle = vi.fn() } = {}) {
  return render(
    <SoundContext.Provider value={soundEnabled}>
      <TaskCard task={TASK} done={done} onToggle={onToggle} />
    </SoundContext.Provider>
  );
}

describe('TaskCard — rendering', () => {
  it('shows the task emoji and label', () => {
    renderCard();
    expect(screen.getByText('🪥')).toBeInTheDocument();
    expect(screen.getByText('Brush Teeth')).toBeInTheDocument();
  });

  it('applies green background when done', () => {
    renderCard({ done: true });
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-green-400/);
  });

  it('applies white background when not done', () => {
    renderCard({ done: false });
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-white/);
  });

  it('shows strikethrough text when done', () => {
    renderCard({ done: true });
    expect(screen.getByText('Brush Teeth').className).toMatch(/line-through/);
  });

  it('does not show strikethrough when not done', () => {
    renderCard({ done: false });
    expect(screen.getByText('Brush Teeth').className).not.toMatch(/line-through/);
  });
});

describe('TaskCard — interactions', () => {
  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    renderCard({ onToggle });
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('calls onToggle when clicking a done card (to uncheck)', () => {
    const onToggle = vi.fn();
    renderCard({ done: true, onToggle });
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('fires confetti when completing a task', async () => {
    const confetti = (await import('canvas-confetti')).default;
    renderCard({ done: false });
    fireEvent.click(screen.getByRole('button'));
    expect(confetti).toHaveBeenCalled();
  });

  it('does not fire confetti when unchecking a task', async () => {
    const confetti = (await import('canvas-confetti')).default;
    confetti.mockClear();
    renderCard({ done: true });
    fireEvent.click(screen.getByRole('button'));
    expect(confetti).not.toHaveBeenCalled();
  });
});

describe('TaskCard — sound gating', () => {
  it('plays robot blip when sound is enabled and task is completed', () => {
    global.__audioCtx()?.createOscillator.mockClear();
    renderCard({ done: false, soundEnabled: true });
    fireEvent.click(screen.getByRole('button'));
    expect(global.__audioCtx()?.createOscillator).toHaveBeenCalled();
  });

  it('does not play robot blip when sound is disabled', () => {
    global.__audioCtx()?.createOscillator.mockClear();
    renderCard({ done: false, soundEnabled: false });
    fireEvent.click(screen.getByRole('button'));
    expect(global.__audioCtx()?.createOscillator).not.toHaveBeenCalled();
  });

  it('does not show praise text when sound is disabled', () => {
    renderCard({ done: false, soundEnabled: false });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText(/🎉/)).not.toBeInTheDocument();
  });

  it('calls AudioContext.createOscillator when sound is enabled', () => {
    global.__audioCtx()?.createOscillator.mockClear();
    renderCard({ done: false, soundEnabled: true });
    fireEvent.click(screen.getByRole('button'));
    expect(global.__audioCtx()?.createOscillator).toHaveBeenCalled();
  });

  it('does not call createOscillator when sound is disabled', () => {
    global.__audioCtx()?.createOscillator.mockClear();
    renderCard({ done: false, soundEnabled: false });
    fireEvent.click(screen.getByRole('button'));
    expect(global.__audioCtx()?.createOscillator).not.toHaveBeenCalled();
  });
});
