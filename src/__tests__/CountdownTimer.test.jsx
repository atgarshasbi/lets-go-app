import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CountdownTimer from '../components/CountdownTimer';

function renderTimer(overrides = {}) {
  const props = {
    minutes: 2,
    setMinutes: vi.fn(),
    maxMinutes: 5,
    running: true,
    resetToken: 0,
    onStart: vi.fn(),
    ...overrides,
  };
  return { ...render(<CountdownTimer {...props} />), props };
}

describe('CountdownTimer — rendering', () => {
  it('shows the initial time formatted as M:SS', () => {
    renderTimer({ minutes: 2 });
    expect(screen.getByText('2:00')).toBeInTheDocument();
  });

  it('shows the Start button initially', () => {
    renderTimer();
    expect(screen.getByText(/Start!/)).toBeInTheDocument();
  });

  it('does not show the timer when done (remaining = 0)', () => {
    // minutes=0 snaps up to MIN_SEC (10s) = 0:10
    renderTimer({ minutes: 0 });
    expect(screen.getByText('0:10')).toBeInTheDocument();
  });

  it('shows the time remaining label', () => {
    renderTimer();
    expect(screen.getByText(/Time left/)).toBeInTheDocument();
  });
});

describe('CountdownTimer — Start button', () => {
  it('calls onStart when Start is clicked', () => {
    const onStart = vi.fn();
    renderTimer({ onStart });
    fireEvent.click(screen.getByText(/Start!/));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('switches to Pause after clicking Start', () => {
    renderTimer();
    fireEvent.click(screen.getByText(/Start!/));
    expect(screen.getByText(/Pause/)).toBeInTheDocument();
  });

  it('does NOT call onStart again when Pause is clicked', () => {
    const onStart = vi.fn();
    renderTimer({ onStart });
    fireEvent.click(screen.getByText(/Start!/));   // start → calls onStart
    fireEvent.click(screen.getByText(/Pause/));    // pause → should NOT call onStart
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('shows Start! again after pausing (internal pause resets started)', () => {
    // Clicking Pause sets started=false, so the button reverts to "Start!"
    // "Resume" only shows when the parent externally sets running=false while started=true
    renderTimer();
    fireEvent.click(screen.getByText(/Start!/));
    fireEvent.click(screen.getByText(/Pause/));
    expect(screen.getByText(/Start!/)).toBeInTheDocument();
  });

  it('shows Resume when running becomes false while timer is started', () => {
    const { rerender, props } = renderTimer({ running: true });
    fireEvent.click(screen.getByText(/Start!/));    // started=true, ticking=true
    rerender(<CountdownTimer {...props} running={false} />);  // ticking stops, started still true
    expect(screen.getByText(/Resume/)).toBeInTheDocument();
  });
});

describe('CountdownTimer — reset', () => {
  it('resets to Start when resetToken changes', () => {
    const { rerender, props } = renderTimer({ resetToken: 0 });
    fireEvent.click(screen.getByText(/Start!/));
    expect(screen.getByText(/Pause/)).toBeInTheDocument();

    rerender(<CountdownTimer {...props} resetToken={1} />);
    expect(screen.getByText(/Start!/)).toBeInTheDocument();
  });
});

describe('CountdownTimer — tick', () => {
  it('decrements time by 1 second per tick when running', () => {
    vi.useFakeTimers();
    renderTimer({ minutes: 1, running: true });
    fireEvent.click(screen.getByText(/Start!/));

    act(() => { vi.advanceTimersByTime(3000); });

    expect(screen.getByText('0:57')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('does not tick when running is false', () => {
    vi.useFakeTimers();
    renderTimer({ minutes: 1, running: false });
    fireEvent.click(screen.getByText(/Start!/));

    act(() => { vi.advanceTimersByTime(3000); });

    expect(screen.getByText('1:00')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
