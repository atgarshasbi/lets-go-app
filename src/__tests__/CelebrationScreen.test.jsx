import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CelebrationScreen from '../components/CelebrationScreen';
import { SoundContext } from '../theme';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

function renderCelebration(overrides = {}) {
  const props = {
    childName: 'Superstar',
    starsEarned: 5,
    celebrationCharacter: 'trophy',
    onClose: vi.fn(),
    ...overrides,
  };
  return render(
    <SoundContext.Provider value={false}>
      <CelebrationScreen {...props} />
    </SoundContext.Provider>
  );
}

describe('CelebrationScreen', () => {
  it('shows the child name', () => {
    renderCelebration({ childName: 'Leo' });
    expect(screen.getByText(/Leo/)).toBeInTheDocument();
  });

  it('displays the correct starsEarned count (regression)', () => {
    // Bug: was showing allTasks.length instead of totalStars
    renderCelebration({ starsEarned: 7 });
    expect(screen.getByText(/7 stars earned/)).toBeInTheDocument();
  });

  it('shows the character emoji for the selected character', () => {
    renderCelebration({ celebrationCharacter: 'unicorn' });
    expect(screen.getByText('🦄')).toBeInTheDocument();
  });

  it('defaults to trophy when character is unknown', () => {
    renderCelebration({ celebrationCharacter: 'nonexistent' });
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('calls onClose when the Done button is clicked', () => {
    const onClose = vi.fn();
    renderCelebration({ onClose });
    fireEvent.click(screen.getByText(/Done/));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders at most 10 star emojis regardless of starsEarned', () => {
    renderCelebration({ starsEarned: 25 });
    // Each visual star is a ⭐ span inside the flex-wrap div
    // The text "25 stars earned!" also contains the count — check capped visual stars
    expect(screen.getByText(/25 stars earned/)).toBeInTheDocument();
    // Count ⭐ elements: should be capped at 10
    const stars = screen.getAllByText('⭐');
    expect(stars.length).toBeLessThanOrEqual(10);
  });
});
