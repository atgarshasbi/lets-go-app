import { useState, useEffect, useCallback } from 'react';

function isStandaloneDisplay() {
  return window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone] = useState(isStandaloneDisplay);
  const [isIOS] = useState(isIOSDevice);
  const [isInstalled, setIsInstalled] = useState(
    () => isStandaloneDisplay() || localStorage.getItem('appInstalled') === 'true'
  );

  useEffect(() => {
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      // Chrome only fires this when it currently considers the site NOT installed,
      // so it's authoritative proof any earlier "installed" flag (e.g. after an
      // uninstall) is stale.
      try {
        localStorage.removeItem('appInstalled');
      } catch {}
      setIsInstalled(false);
    }
    function handleAppInstalled() {
      try {
        localStorage.setItem('appInstalled', 'true');
      } catch {}
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    isStandalone,
    isIOS,
    isInstalled,
    canPromptInstall: !!deferredPrompt,
    promptInstall,
  };
}
