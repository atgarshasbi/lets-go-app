import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstallBanner from '../components/InstallBanner';

function setUserAgent(ua) {
  Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
}

describe('InstallBanner', () => {
  afterEach(() => {
    setUserAgent(window.navigator.userAgent);
    localStorage.clear();
  });

  it('always shows an Install App button on a non-iOS browser', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    render(<InstallBanner />);

    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument();
  });

  it('shows iOS instructions when tapped on an iPhone (no native install prompt exists there)', async () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');

    render(<InstallBanner />);
    await userEvent.click(screen.getByRole('button', { name: /install app/i }));

    expect(screen.getByText(/Add to Home Screen/i)).toBeInTheDocument();
  });

  it('shows generic browser-menu instructions when tapped with no native prompt available', async () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    render(<InstallBanner />);
    await userEvent.click(screen.getByRole('button', { name: /install app/i }));

    expect(screen.getByText(/Install app/i, { selector: 'strong' })).toBeInTheDocument();
  });

  it('renders nothing once the app has been installed (remembered via appinstalled event)', () => {
    localStorage.setItem('appInstalled', 'true');
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    const { container } = render(<InstallBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the button again if beforeinstallprompt fires after being marked installed (e.g. after an uninstall)', () => {
    localStorage.setItem('appInstalled', 'true');
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    render(<InstallBanner />);
    expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('beforeinstallprompt', { cancelable: true }));
    });

    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument();
    expect(localStorage.getItem('appInstalled')).toBeNull();
  });
});
