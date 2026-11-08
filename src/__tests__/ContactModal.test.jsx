import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactModal from '../components/ContactModal';
import { ThemeContext, THEMES } from '../theme';

function renderModal(onClose = vi.fn()) {
  return render(
    <ThemeContext.Provider value={THEMES.purple}>
      <ContactModal onClose={onClose} />
    </ThemeContext.Provider>
  );
}

describe('ContactModal — fallback email', () => {
  it('shows a direct mailto fallback in case the form itself is broken', () => {
    renderModal();

    const link = screen.getByRole('link', { name: 'contact@letsgoroutine.app' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'mailto:contact@letsgoroutine.app');
  });
});
