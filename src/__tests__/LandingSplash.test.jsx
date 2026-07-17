import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LandingSplash from '../components/LandingSplash';

describe('LandingSplash', () => {
  it('shows the app pitch and a start button', () => {
    render(<LandingSplash onStart={() => {}} />);

    expect(screen.getByText(/Let's Go!/)).toBeInTheDocument();
    expect(screen.getByText(/star chart app for toddlers/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start now/i })).toBeInTheDocument();
  });

  it('calls onStart when the button is clicked', async () => {
    const onStart = vi.fn();
    render(<LandingSplash onStart={onStart} />);

    await userEvent.click(screen.getByRole('button', { name: /start now/i }));

    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
