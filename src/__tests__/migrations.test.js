import { describe, it, expect, beforeEach } from 'vitest';
import { runMigrations } from '../utils/migrations';

beforeEach(() => localStorage.clear());

describe('runMigrations', () => {
  it('does nothing when dataVersion is already current', () => {
    localStorage.setItem('dataVersion', '1');
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

  it('sets dataVersion to 1 after running', () => {
    runMigrations();
    expect(localStorage.getItem('dataVersion')).toBe('1');
  });

  it('handles no sections in localStorage without throwing', () => {
    expect(() => runMigrations()).not.toThrow();
    expect(localStorage.getItem('dataVersion')).toBe('1');
  });

  it('handles invalid JSON in sections without throwing', () => {
    localStorage.setItem('sections', 'not valid json {{');
    expect(() => runMigrations()).not.toThrow();
    expect(localStorage.getItem('dataVersion')).toBe('1');
  });
});
