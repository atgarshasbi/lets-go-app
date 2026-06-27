import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from '../components/Settings';
import { THEMES, CHARACTERS } from '../theme';

function renderSettings(overrides = {}) {
  const props = {
    childName: 'Superstar',
    setChildName: vi.fn(),
    pin: '1234',
    setPin: vi.fn(),
    timerMinutes: 5,
    setTimerMinutes: vi.fn(),
    timerMaxMinutes: 10,
    setTimerMaxMinutes: vi.fn(),
    themeKey: 'purple',
    setThemeKey: vi.fn(),
    celebrationCharacter: 'trophy',
    setCelebrationCharacter: vi.fn(),
    ...overrides,
  };
  return render(<Settings {...props} />);
}

describe('Settings — general', () => {
  it('shows the current child name in the input', () => {
    renderSettings({ childName: 'Mia' });
    expect(screen.getByDisplayValue('Mia')).toBeInTheDocument();
  });

  it('calls setChildName with trimmed name when Save is clicked', () => {
    const setChildName = vi.fn();
    renderSettings({ childName: 'Mia', setChildName });

    const input = screen.getByDisplayValue('Mia');
    fireEvent.change(input, { target: { value: '  Leo  ' } });
    fireEvent.click(screen.getByText('Save'));

    expect(setChildName).toHaveBeenCalledWith('Leo');
  });

  it('shows "Saved!" feedback after clicking Save', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText(/Saved!/)).toBeInTheDocument();
  });
});

describe('Settings — theme', () => {
  it('renders a button for each theme color', () => {
    renderSettings();
    const themeCount = Object.keys(THEMES).length;
    // Each theme button has a title equal to the theme key
    Object.keys(THEMES).forEach(key => {
      expect(screen.getByTitle(key)).toBeInTheDocument();
    });
    expect(screen.getAllByTitle(/.+/).length).toBeGreaterThanOrEqual(themeCount);
  });

  it('calls setThemeKey when a theme button is clicked', () => {
    const setThemeKey = vi.fn();
    renderSettings({ setThemeKey });
    fireEvent.click(screen.getByTitle('blue'));
    expect(setThemeKey).toHaveBeenCalledWith('blue');
  });
});

describe('Settings — celebration character', () => {
  it('renders all character options', () => {
    renderSettings();
    Object.values(CHARACTERS).forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('calls setCelebrationCharacter when a character is clicked', () => {
    const setCelebrationCharacter = vi.fn();
    renderSettings({ setCelebrationCharacter });
    fireEvent.click(screen.getByText('Unicorn'));
    expect(setCelebrationCharacter).toHaveBeenCalledWith('unicorn');
  });
});

describe('Settings — PIN change', () => {
  it('shows error when current PIN is wrong', () => {
    renderSettings({ pin: '1234' });
    const [currentInput] = screen.getAllByPlaceholderText('••••');
    fireEvent.change(currentInput, { target: { value: '9999' } });
    fireEvent.click(screen.getByText('Change PIN'));
    expect(screen.getByText(/Current PIN is wrong/)).toBeInTheDocument();
  });

  it('shows error when new PIN is not 4 digits', () => {
    renderSettings({ pin: '1234' });
    const [currentInput, newInput] = screen.getAllByPlaceholderText('••••');
    fireEvent.change(currentInput, { target: { value: '1234' } });
    fireEvent.change(newInput, { target: { value: '12' } });
    fireEvent.click(screen.getByText('Change PIN'));
    expect(screen.getByText(/exactly 4 digits/)).toBeInTheDocument();
  });

  it('shows error when new PIN and confirm do not match', () => {
    renderSettings({ pin: '1234' });
    const [currentInput, newInput, confirmInput] = screen.getAllByPlaceholderText('••••');
    fireEvent.change(currentInput, { target: { value: '1234' } });
    fireEvent.change(newInput, { target: { value: '5678' } });
    fireEvent.change(confirmInput, { target: { value: '9999' } });
    fireEvent.click(screen.getByText('Change PIN'));
    expect(screen.getByText(/do not match/)).toBeInTheDocument();
  });

  it('calls setPin when all fields are valid', () => {
    const setPin = vi.fn();
    renderSettings({ pin: '1234', setPin });
    const [currentInput, newInput, confirmInput] = screen.getAllByPlaceholderText('••••');
    fireEvent.change(currentInput, { target: { value: '1234' } });
    fireEvent.change(newInput, { target: { value: '5678' } });
    fireEvent.change(confirmInput, { target: { value: '5678' } });
    fireEvent.click(screen.getByText('Change PIN'));
    expect(setPin).toHaveBeenCalledWith('5678');
    expect(screen.getByText(/PIN changed/)).toBeInTheDocument();
  });
});
