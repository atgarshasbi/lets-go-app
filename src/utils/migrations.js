const CURRENT_VERSION = 2;

const EXISTING_DATA_KEYS = ['sections', 'taskPool', 'completedToday', 'childName'];

export function runMigrations() {
  const stored = parseInt(localStorage.getItem('dataVersion') || '0', 10);

  if (stored < CURRENT_VERSION) {
    if (stored < 1) {
      // v0 → v1: add `enabled: true` to any sections that predate the field
      try {
        const raw = localStorage.getItem('sections');
        if (raw) {
          const sections = JSON.parse(raw);
          if (Array.isArray(sections)) {
            localStorage.setItem('sections', JSON.stringify(
              sections.map(s => ({ enabled: true, ...s }))
            ));
          }
        }
      } catch (_) {}
    }

    if (stored < 2) {
      // v1 → v2: totalStars used to be a manually incremented counter;
      // it's now derived from completedToday + bonusStars each render.
      // Estimate the bonus-only portion so existing users don't lose stars
      // that came from the bonus button rather than a completed task.
      try {
        const hasOldTotal = localStorage.getItem('totalStars') !== null;
        const hasNewBonus = localStorage.getItem('bonusStars') !== null;
        if (hasOldTotal && !hasNewBonus) {
          const oldTotal = JSON.parse(localStorage.getItem('totalStars')) || 0;
          const completedRaw = localStorage.getItem('completedToday');
          const completed = completedRaw ? JSON.parse(completedRaw) : [];
          const bonus = Math.max(0, oldTotal - (Array.isArray(completed) ? completed.length : 0));
          localStorage.setItem('bonusStars', JSON.stringify(bonus));
        }
      } catch (_) {}
    }

    localStorage.setItem('dataVersion', String(CURRENT_VERSION));
  }

  // Backfill hasVisited so people who already used the app never see the new landing splash
  if (localStorage.getItem('hasVisited') === null) {
    const hasExistingData = EXISTING_DATA_KEYS.some(key => localStorage.getItem(key) !== null);
    if (hasExistingData) {
      localStorage.setItem('hasVisited', 'true');
    }
  }
}
