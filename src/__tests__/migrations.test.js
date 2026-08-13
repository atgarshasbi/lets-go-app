import { describe, it, expect, beforeEach } from 'vitest';
import { runMigrations } from '../utils/migrations';

beforeEach(() => localStorage.clear());

describe('runMigrations', () => {
  it('does nothing when dataVersion is already current', () => {
    localStorage.setItem('dataVersion', '2');
    const sections = [{ id: 'a', enabled: false, tasks: [] }];
    localStorage.setItem('sections', JSON.stringify(sections));

    runMigrations();

    expect(JSON.parse(localStorage.getItem('sections'))[0].enabled).toBe(false);
  });

  it('adds enabled:true to sections missing the field', () => {
    const sections = [
      { id: 'morning', title: 'Morning', tasks: [] },
      { id: 'bedtime', title: 'Bedtime', tasks: [] },
    ];
    localStorage.setItem('sections', JSON.stringify(sections));

    runMigrations();

    const result = JSON.parse(localStorage.getItem('sections'));
    expect(result[0].enabled).toBe(true);
    expect(result[1].enabled).toBe(true);
  });

  it('preserves enabled:false on sections that already have it', () => {
    const sections = [{ id: 'a', enabled: false, tasks: [] }];
    localStorage.setItem('sections', JSON.stringify(sections));

    runMigrations();

    const result = JSON.parse(localStorage.getItem('sections'));
    expect(result[0].enabled).toBe(false);
  });

  it('preserves enabled:true on sections that already have it', () => {
    const sections = [{ id: 'a', enabled: true, tasks: [] }];
    localStorage.setItem('sections', JSON.stringify(sections));

    runMigrations();

    const result = JSON.parse(localStorage.getItem('sections'));
    expect(result[0].enabled).toBe(true);
  });

  it('sets dataVersion to 2 after running', () => {
    runMigrations();
    expect(localStorage.getItem('dataVersion')).toBe('2');
  });

  it('handles no sections in localStorage without throwing', () => {
    expect(() => runMigrations()).not.toThrow();
    expect(localStorage.getItem('dataVersion')).toBe('2');
  });

  it('handles invalid JSON in sections without throwing', () => {
    localStorage.setItem('sections', 'not valid json {{');
    expect(() => runMigrations()).not.toThrow();
    expect(localStorage.getItem('dataVersion')).toBe('2');
  });

  it('backfills hasVisited for users with existing data (skip the new landing splash)', () => {
    localStorage.setItem('childName', 'Milo');

    runMigrations();

    expect(localStorage.getItem('hasVisited')).toBe('true');
  });

  it('leaves hasVisited unset for a brand new user (so they see the landing splash)', () => {
    runMigrations();

    expect(localStorage.getItem('hasVisited')).toBeNull();
  });

  it('does not override an explicit hasVisited value already set', () => {
    localStorage.setItem('hasVisited', 'false');
    localStorage.setItem('childName', 'Milo');

    runMigrations();

    expect(localStorage.getItem('hasVisited')).toBe('false');
  });

  it('estimates bonusStars from the old totalStars counter minus completed tasks', () => {
    localStorage.setItem('totalStars', JSON.stringify(5));
    localStorage.setItem('completedToday', JSON.stringify(['task-1', 'task-2']));

    runMigrations();

    expect(JSON.parse(localStorage.getItem('bonusStars'))).toBe(3);
  });

  it('floors the bonusStars estimate at 0 when completed tasks exceed the old total', () => {
    localStorage.setItem('totalStars', JSON.stringify(1));
    localStorage.setItem('completedToday', JSON.stringify(['task-1', 'task-2']));

    runMigrations();

    expect(JSON.parse(localStorage.getItem('bonusStars'))).toBe(0);
  });

  it('does not set bonusStars for a brand new user with no old totalStars', () => {
    runMigrations();

    expect(localStorage.getItem('bonusStars')).toBeNull();
  });

  it('does not overwrite an existing bonusStars value', () => {
    localStorage.setItem('totalStars', JSON.stringify(5));
    localStorage.setItem('bonusStars', JSON.stringify(9));

    runMigrations();

    expect(JSON.parse(localStorage.getItem('bonusStars'))).toBe(9);
  });
});
