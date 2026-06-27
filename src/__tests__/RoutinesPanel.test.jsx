import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import RoutinesPanel from '../components/RoutinesPanel';
import { ThemeContext, THEMES } from '../theme';

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
  {
    id: 'bedtime',
    title: 'Bedtime',
    emoji: '🌙',
    enabled: false,
    tasks: [],
  },
];

// Stateful wrapper so real setSections updates propagate to the DOM
function PanelWrapper({ initialSections = MOCK_SECTIONS }) {
  const [sections, setSections] = useState(initialSections);
  return (
    <ThemeContext.Provider value={THEMES.purple}>
      <RoutinesPanel sections={sections} setSections={setSections} />
    </ThemeContext.Provider>
  );
}

function renderPanel(initialSections = MOCK_SECTIONS) {
  return render(<PanelWrapper initialSections={initialSections} />);
}

describe('RoutinesPanel — rendering', () => {
  it('renders all section titles', () => {
    renderPanel();
    expect(screen.getByText('Morning')).toBeInTheDocument();
    expect(screen.getByText('Bedtime')).toBeInTheDocument();
  });

  it('shows task count per section', () => {
    renderPanel();
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
    expect(screen.getByText('0 tasks')).toBeInTheDocument();
  });

  it('shows the New Routine button', () => {
    renderPanel();
    expect(screen.getByText(/New Routine/)).toBeInTheDocument();
  });
});

describe('RoutinesPanel — expand / collapse', () => {
  it('expands a section when the header is clicked', () => {
    renderPanel();
    expect(screen.queryByText('Brush Teeth')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Morning'));
    expect(screen.getByText('Brush Teeth')).toBeInTheDocument();
    expect(screen.getByText('Get Dressed')).toBeInTheDocument();
  });

  it('collapses an open section when clicked again', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Morning'));
    expect(screen.getByText('Brush Teeth')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Morning'));
    expect(screen.queryByText('Brush Teeth')).not.toBeInTheDocument();
  });
});

describe('RoutinesPanel — enable / disable toggle', () => {
  it('toggling a section switches its visual opacity (enabled → disabled)', () => {
    renderPanel();
    // The Morning section starts enabled (full opacity); the containing div
    // gets opacity-55 when disabled.
    const morningCard = screen.getByText('Morning').closest('.bg-white');
    expect(morningCard).not.toHaveClass('opacity-55');

    // Toggle buttons are rendered — find the one inside the Morning card
    const toggleBtn = morningCard.querySelector('button[type="button"]');
    fireEvent.click(toggleBtn);

    expect(morningCard).toHaveClass('opacity-55');
  });

  it('re-enabling a disabled section removes the opacity class', () => {
    renderPanel();
    const bedtimeCard = screen.getByText('Bedtime').closest('.bg-white');
    expect(bedtimeCard).toHaveClass('opacity-55');

    const toggleBtn = bedtimeCard.querySelector('button[type="button"]');
    fireEvent.click(toggleBtn);

    expect(bedtimeCard).not.toHaveClass('opacity-55');
  });
});

describe('RoutinesPanel — delete section', () => {
  it('shows a confirm dialog before deleting', () => {
    renderPanel();
    // Trash button is the 🗑 button in the header — not inside expanded content
    const trashBtns = screen.getAllByText('🗑');
    fireEvent.click(trashBtns[0]);

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('cancels deletion when "No" is clicked', () => {
    renderPanel();
    fireEvent.click(screen.getAllByText('🗑')[0]);
    fireEvent.click(screen.getByText('No'));

    expect(screen.getByText('Morning')).toBeInTheDocument();
  });

  it('removes the section when "Delete" is confirmed', () => {
    renderPanel();
    fireEvent.click(screen.getAllByText('🗑')[0]);
    fireEvent.click(screen.getByText('Delete'));

    expect(screen.queryByText('Morning')).not.toBeInTheDocument();
    expect(screen.getByText('Bedtime')).toBeInTheDocument();
  });
});

describe('RoutinesPanel — add task', () => {
  it('shows "No tasks yet" message in an empty expanded section', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Bedtime'));
    expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
  });

  it('Add button is disabled when the task label is empty', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Bedtime'));
    const addBtn = screen.getByRole('button', { name: 'Add' });
    expect(addBtn).toBeDisabled();
  });

  it('adds a new task when label is filled and Add is clicked', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Morning'));

    const input = screen.getByPlaceholderText(/Add a task/);
    fireEvent.change(input, { target: { value: 'Wash Hands' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Wash Hands')).toBeInTheDocument();
  });

  it('clears the input after adding a task', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Morning'));

    const input = screen.getByPlaceholderText(/Add a task/);
    fireEvent.change(input, { target: { value: 'Wash Hands' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(input.value).toBe('');
  });

  it('deletes a task when × is clicked', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Morning'));

    expect(screen.getByText('Brush Teeth')).toBeInTheDocument();
    const deleteBtns = screen.getAllByText('×');
    fireEvent.click(deleteBtns[0]);

    expect(screen.queryByText('Brush Teeth')).not.toBeInTheDocument();
  });
});

describe('RoutinesPanel — create new section', () => {
  it('opens the new section form when "+ New Routine" is clicked', () => {
    renderPanel();
    fireEvent.click(screen.getByText(/New Routine/));
    expect(screen.getByPlaceholderText(/Routine name/)).toBeInTheDocument();
  });

  it('Create button is disabled when section name is empty', () => {
    renderPanel();
    fireEvent.click(screen.getByText(/New Routine/));
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('creates a new section with the given name', () => {
    renderPanel();
    fireEvent.click(screen.getByText(/New Routine/));

    fireEvent.change(screen.getByPlaceholderText(/Routine name/), {
      target: { value: 'Meal Time' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(screen.getByText('Meal Time')).toBeInTheDocument();
  });

  it('closes the form when Cancel is clicked', () => {
    renderPanel();
    fireEvent.click(screen.getByText(/New Routine/));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByPlaceholderText(/Routine name/)).not.toBeInTheDocument();
  });
});
