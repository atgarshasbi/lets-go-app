import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StrictMode } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';
import { DEFAULT_SECTIONS } from '../data/defaultData';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

function seedLocalStorage() {
  localStorage.setItem('hasVisited', JSON.stringify(true));
  localStorage.setItem('unlocked', JSON.stringify(true));
  localStorage.setItem('pin', JSON.stringify('1234'));
  localStorage.setItem('sections', JSON.stringify([
    {
      id: 'morning', title: 'Morning', emoji: '☀️', enabled: true,
      tasks: [{ id: 'task-1', emoji: '🪥', label: 'Brush Teeth' }],
    },
    {
      id: 'bedtime', title: 'Bedtime', emoji: '🌙', enabled: true,
      tasks: [{ id: 'task-2', emoji: '📚', label: 'Book' }],
    },
  ]));
  localStorage.setItem('completedToday', JSON.stringify(['task-1', 'task-2']));
}

describe('App — star count reflects the active (enabled + existing) task list', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    seedLocalStorage();
  });

  function goToParent() {
    fireEvent.click(screen.getByText('🔒 Parent'));
    ['1', '2', '3', '4'].forEach(d => fireEvent.click(screen.getByRole('button', { name: d })));
  }

  function backToKidsView() {
    fireEvent.click(screen.getByText(/Back to Kids View/));
  }

  it('drops the star when a completed task is deleted directly', async () => {
    render(<App />);
    expect(await screen.findByText('2 ⭐')).toBeInTheDocument();

    goToParent();
    fireEvent.click(screen.getByText('Morning'));
    fireEvent.click(screen.getAllByText('×')[0]);

    backToKidsView();
    expect(await screen.findByText('1 ⭐')).toBeInTheDocument();
  });

  it('drops the star when the whole routine containing a completed task is deleted', async () => {
    render(<App />);
    expect(await screen.findByText('2 ⭐')).toBeInTheDocument();

    goToParent();
    fireEvent.click(screen.getAllByText('🗑')[0]);
    fireEvent.click(screen.getByText('Delete'));

    backToKidsView();
    expect(await screen.findByText('1 ⭐')).toBeInTheDocument();
  });

  it('drops both stars on Reset to Default List', async () => {
    render(<App />);
    expect(await screen.findByText('2 ⭐')).toBeInTheDocument();

    goToParent();
    fireEvent.click(screen.getByText('Reset to Default List'));
    fireEvent.click(screen.getByText('Reset to Default'));

    backToKidsView();
    expect(await screen.findByText('0 ⭐')).toBeInTheDocument();
  });

  it('hides the star while its routine is disabled, and restores it when re-enabled', async () => {
    render(<App />);
    expect(await screen.findByText('2 ⭐')).toBeInTheDocument();

    goToParent();
    const morningCard = screen.getByText('Morning').closest('.bg-white');
    fireEvent.click(within(morningCard).getByRole('switch'));

    backToKidsView();
    expect(await screen.findByText('1 ⭐')).toBeInTheDocument();

    goToParent();
    const morningCardAgain = screen.getByText('Morning').closest('.bg-white');
    fireEvent.click(within(morningCardAgain).getByRole('switch'));

    backToKidsView();
    expect(await screen.findByText('2 ⭐')).toBeInTheDocument();
  });

  it('under StrictMode, drops all 3 stars when Morning (3 completed tasks) is deleted from the real default list', async () => {
    localStorage.setItem('sections', JSON.stringify(DEFAULT_SECTIONS));
    const morning = DEFAULT_SECTIONS.find(s => s.id === 'morning');
    const completedIds = morning.tasks.slice(0, 3).map(t => t.id);
    localStorage.setItem('completedToday', JSON.stringify(completedIds));

    render(<StrictMode><App /></StrictMode>);
    expect(await screen.findByText('3 ⭐')).toBeInTheDocument();

    goToParent();
    fireEvent.click(screen.getByText('Morning'));
    const morningCard = screen.getByText('Morning').closest('.bg-white');
    fireEvent.click(within(morningCard).getByText('🗑'));
    fireEvent.click(screen.getByText('Delete'));

    backToKidsView();
    expect(await screen.findByText('0 ⭐')).toBeInTheDocument();
  });

  it('keeps bonus stars intact when a routine is deleted', async () => {
    localStorage.setItem('bonusStars', JSON.stringify(2));
    render(<App />);
    expect(await screen.findByText('4 ⭐')).toBeInTheDocument();

    goToParent();
    fireEvent.click(screen.getAllByText('🗑')[0]);
    fireEvent.click(screen.getByText('Delete'));

    backToKidsView();
    expect(await screen.findByText('3 ⭐')).toBeInTheDocument();
  });
});
