import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

describe('App — unlock banner skips the PIN screen', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('hasVisited', JSON.stringify(true));
    localStorage.setItem('unlocked', JSON.stringify(false));
  });

  it('goes straight to the buy screen, never showing the PIN entry', async () => {
    render(<App />);

    fireEvent.click(await screen.findByText(/Unlock Everything/));

    expect(screen.queryByText(/Enter your PIN/)).not.toBeInTheDocument();
    expect(await screen.findByText(/Unlock the Full Experience/)).toBeInTheDocument();
  });

  it('the small 🔒 Parent button still requires the PIN', async () => {
    render(<App />);

    fireEvent.click(await screen.findByText('🔒 Parent'));

    expect(await screen.findByText(/Enter your PIN/)).toBeInTheDocument();
  });
});
