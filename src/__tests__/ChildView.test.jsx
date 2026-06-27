import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChildView from '../components/ChildView';
import { ThemeContext, SoundContext, THEMES } from '../theme';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const MOCK_SECTIONS = [
  {
    id: 'morning',
    title: 'Morning',
    emoji: '☀️',
    enabled: true,
    tasks: [
      { id: 'task-1', emoji: '🪥', label: 'Brush Teeth' },
      { id: 'task-2', emoji: '👗', label: 'Get Dressed' },
    ],
  },
];

const ALL_TASKS_DONE = ['task-1', 'task-2'];

function renderChildView(overrides = {}) {
  const props = {
    childName: 'Superstar',
    totalStars: 0,
    timerMinutes: 0,
    setTimerMinutes: vi.fn(),
    timerMaxMinutes: 3,
    timerResetToken: 0,
    timerPaused: false,
    sections: MOCK_SECTIONS,
    completedToday: [],
    celebrationCharacter: 'trophy',
    soundEnabled: true,
    setSoundEnabled: vi.fn(),
    handleTaskToggle: vi.fn(),
    handleResetToday: vi.fn(),
    handleBonusStar: vi.fn(),
    onParentPress: vi.fn(),
    onTimerPause: vi.fn(),
    onTimerResume: vi.fn(),
    ...overrides,
  };

  return render(
    <ThemeContext.Provider value={THEMES.purple}>
      <SoundContext.Provider value={props.soundEnabled}>
        <ChildView {...props} />
      </SoundContext.Provider>
    </ThemeContext.Provider>
  );
}

describe('ChildView — greeting', () => {
  it('shows the child name', () => {
    renderChildView({ childName: 'Alex' });
    expect(screen.getByText(/Hi, Alex/)).toBeInTheDocument();
  });
});

describe('ChildView — Start Over button', () => {
  it('is hidden when there is no progress', () => {
    renderChildView({ totalStars: 0, completedToday: [] });
    expect(screen.queryByText(/Start Over/)).not.toBeInTheDocument();
  });

  it('shows when at least one task is completed', () => {
    renderChildView({ totalStars: 1, completedToday: ['task-1'] });
    expect(screen.getByText(/Start Over/)).toBeInTheDocument();
  });

  it('shows when there are only bonus stars and no tasks done (regression)', () => {
    // Bug: Start Over was invisible when bonus stars existed but no tasks were ticked
    renderChildView({ totalStars: 3, completedToday: [] });
    expect(screen.getByText(/Start Over/)).toBeInTheDocument();
  });

  it('calls handleResetToday when clicked', () => {
    const handleResetToday = vi.fn();
    renderChildView({ totalStars: 1, completedToday: ['task-1'], handleResetToday });
    fireEvent.click(screen.getByText(/Start Over/));
    expect(handleResetToday).toHaveBeenCalledOnce();
  });
});

describe('ChildView — All Done button', () => {
  it('is hidden when there is no progress', () => {
    renderChildView({ totalStars: 0, completedToday: [] });
    expect(screen.queryByText(/All Done/)).not.toBeInTheDocument();
  });

  it('shows when some tasks are completed', () => {
    renderChildView({ totalStars: 1, completedToday: ['task-1'] });
    expect(screen.getByText(/All Done/)).toBeInTheDocument();
  });

  it('still shows when ALL tasks are completed (regression)', () => {
    // Bug: button was hidden when allDone=true; after closing celebration there was no way back
    renderChildView({ totalStars: 2, completedToday: ALL_TASKS_DONE });
    expect(screen.getByText(/All Done/)).toBeInTheDocument();
  });

  it('shows when there are only bonus stars and no tasks done', () => {
    renderChildView({ totalStars: 2, completedToday: [] });
    expect(screen.getByText(/All Done/)).toBeInTheDocument();
  });

  it('calls onTimerPause when clicked', () => {
    const onTimerPause = vi.fn();
    renderChildView({ totalStars: 1, completedToday: ['task-1'], onTimerPause });
    fireEvent.click(screen.getByText(/All Done/));
    expect(onTimerPause).toHaveBeenCalledOnce();
  });

  it('opens celebration screen when clicked', () => {
    renderChildView({ totalStars: 1, completedToday: ['task-1'] });
    fireEvent.click(screen.getByText(/All Done/));
    expect(screen.getByText(/YOU DID IT/)).toBeInTheDocument();
  });
});

describe('ChildView — sound toggle', () => {
  it('shows 🔊 when sound is enabled', () => {
    renderChildView({ soundEnabled: true });
    expect(screen.getByTitle(/Mute sounds/)).toBeInTheDocument();
  });

  it('shows 🔇 when sound is disabled', () => {
    renderChildView({ soundEnabled: false });
    expect(screen.getByTitle(/Unmute sounds/)).toBeInTheDocument();
  });

  it('calls setSoundEnabled when the toggle is clicked', () => {
    const setSoundEnabled = vi.fn();
    renderChildView({ soundEnabled: true, setSoundEnabled });
    fireEvent.click(screen.getByTitle(/Mute sounds/));
    expect(setSoundEnabled).toHaveBeenCalledOnce();
  });
});

describe('ChildView — task sections', () => {
  it('renders task section titles', () => {
    renderChildView();
    expect(screen.getByText('Morning')).toBeInTheDocument();
  });

  it('shows "No tasks today" when all sections are disabled', () => {
    const disabledSections = MOCK_SECTIONS.map(s => ({ ...s, enabled: false }));
    renderChildView({ sections: disabledSections });
    expect(screen.getByText(/No tasks today/)).toBeInTheDocument();
  });

  it('does not render disabled sections', () => {
    const sections = [
      { ...MOCK_SECTIONS[0], enabled: true },
      { id: 'bedtime', title: 'Bedtime', emoji: '🌙', enabled: false, tasks: [] },
    ];
    renderChildView({ sections });
    expect(screen.getByText('Morning')).toBeInTheDocument();
    expect(screen.queryByText('Bedtime')).not.toBeInTheDocument();
  });
});

describe('ChildView — timer', () => {
  it('hides the timer when timerMinutes is 0', () => {
    renderChildView({ timerMinutes: 0 });
    expect(screen.queryByText(/Time left/)).not.toBeInTheDocument();
  });
});

describe('ChildView — parent button', () => {
  it('calls onParentPress when Parent button clicked', () => {
    const onParentPress = vi.fn();
    renderChildView({ onParentPress });
    fireEvent.click(screen.getByText(/Parent/));
    expect(onParentPress).toHaveBeenCalledOnce();
  });
});
