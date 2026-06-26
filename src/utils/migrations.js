const CURRENT_VERSION = 1;

export function runMigrations() {
  const stored = parseInt(localStorage.getItem('dataVersion') || '0', 10);
  if (stored >= CURRENT_VERSION) return;

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

  localStorage.setItem('dataVersion', String(CURRENT_VERSION));
}
