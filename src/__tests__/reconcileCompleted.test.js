import { describe, it, expect } from 'vitest';
import { activeCompletedCount, pruneDeletedTasks } from '../utils/reconcileCompleted';

const sections = [
  { id: 'morning', title: 'Morning', enabled: true, tasks: [{ id: 'mo-1' }, { id: 'mo-2' }] },
  { id: 'bedtime', title: 'Bedtime', enabled: false, tasks: [{ id: 'bt-1' }] },
];

describe('activeCompletedCount', () => {
  it('counts completed tasks in enabled sections', () => {
    expect(activeCompletedCount(sections, ['mo-1', 'mo-2'])).toBe(2);
  });

  it('excludes completed tasks whose section is disabled', () => {
    expect(activeCompletedCount(sections, ['mo-1', 'bt-1'])).toBe(1);
  });

  it('excludes completed ids whose task no longer exists anywhere', () => {
    expect(activeCompletedCount(sections, ['mo-1', 'deleted-task'])).toBe(1);
  });

  it('is 0 when completedToday is empty', () => {
    expect(activeCompletedCount(sections, [])).toBe(0);
  });

  it('goes back up once a disabled section is re-enabled', () => {
    const reEnabled = sections.map(s => s.id === 'bedtime' ? { ...s, enabled: true } : s);
    expect(activeCompletedCount(reEnabled, ['mo-1', 'bt-1'])).toBe(2);
  });
});

describe('pruneDeletedTasks', () => {
  it('keeps ids that still exist, enabled or not', () => {
    expect(pruneDeletedTasks(sections, ['mo-1', 'bt-1'])).toEqual(['mo-1', 'bt-1']);
  });

  it('drops ids whose task/section was actually deleted', () => {
    expect(pruneDeletedTasks(sections, ['mo-1', 'old-deleted-id'])).toEqual(['mo-1']);
  });

  it('is a no-op when completedToday is empty', () => {
    expect(pruneDeletedTasks(sections, [])).toEqual([]);
  });
});
