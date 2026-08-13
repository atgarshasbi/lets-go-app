// completedToday holds task ids marked done today, regardless of whether
// their routine is currently enabled — a kid's completion history for the
// day shouldn't vanish just because a parent toggles a routine off. But the
// star count displayed should only reflect what's currently active: tasks
// whose routine got deleted, or is temporarily disabled, don't count.
export function activeCompletedCount(sections, completedToday) {
  const enabledTaskIds = new Set(
    sections.filter(s => s.enabled !== false).flatMap(s => s.tasks.map(t => t.id))
  );
  return completedToday.filter(id => enabledTaskIds.has(id)).length;
}

// Drop ids from completedToday whose task no longer exists in any section
// (enabled or disabled) — i.e. was actually deleted, not just hidden. Pure
// hygiene so the stored array doesn't grow forever; not required for the
// star count to be correct, since activeCompletedCount already excludes them.
export function pruneDeletedTasks(sections, completedToday) {
  const allTaskIds = new Set(sections.flatMap(s => s.tasks.map(t => t.id)));
  return completedToday.filter(id => allTaskIds.has(id));
}
