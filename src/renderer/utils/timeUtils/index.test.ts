import { describe, expect, it } from 'vitest';
import { formatFullTime, formatTime, getDayName } from './index';

describe('timeUtils', () => {
  it('formats HH:mm with leading zeros', () => {
    const date = new Date(2026, 0, 5, 7, 3, 9);
    expect(formatTime(date)).toBe('07:03');
  });

  it('formats full time as YY-MM-DD HH:mm:ss', () => {
    const date = new Date(2026, 10, 9, 18, 4, 6);
    expect(formatFullTime(date)).toBe('26-11-09 18:04:06');
  });

  it('returns localized day name', () => {
    const date = new Date('2026-05-17T12:00:00');
    expect(getDayName(date)).toBe('周日');
  });
});
