/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

/**
 * @file defaults.test.ts
 * @description 单元测试文件
 * @author 鸡哥
 */

import { describe, expect, it } from 'vitest';
import { getDefaultCountdown, getDefaultTimerData, emptyNotification, emptyMediaInfo } from '../defaults';

describe('getDefaultCountdown', () => {
  it('returns an object with targetDate, label, and enabled fields', () => {
    const result = getDefaultCountdown();
    expect(result).toHaveProperty('targetDate');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('enabled');
  });

  it('sets targetDate approximately 24 hours in the future', () => {
    const before = Date.now();
    const result = getDefaultCountdown();
    const after = Date.now();

    const target = new Date(result.targetDate).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // Allow a few seconds of tolerance
    expect(target).toBeGreaterThanOrEqual(before + twentyFourHours - 5000);
    expect(target).toBeLessThanOrEqual(after + twentyFourHours + 5000);
  });

  it('sets label to "明天"', () => {
    const result = getDefaultCountdown();
    expect(result.label).toBe('明天');
  });

  it('sets enabled to true', () => {
    const result = getDefaultCountdown();
    expect(result.enabled).toBe(true);
  });

  it('returns a valid ISO date string for targetDate', () => {
    const result = getDefaultCountdown();
    expect(() => new Date(result.targetDate)).not.toThrow();
    expect(new Date(result.targetDate).toISOString()).toBe(result.targetDate);
  });
});

describe('getDefaultTimerData', () => {
  it('returns an object with all expected fields', () => {
    const result = getDefaultTimerData();
    expect(result).toHaveProperty('state');
    expect(result).toHaveProperty('remainingSeconds');
    expect(result).toHaveProperty('inputHours');
    expect(result).toHaveProperty('inputMinutes');
    expect(result).toHaveProperty('inputSeconds');
  });

  it('sets state to "idle"', () => {
    const result = getDefaultTimerData();
    expect(result.state).toBe('idle');
  });

  it('sets remainingSeconds to 0', () => {
    const result = getDefaultTimerData();
    expect(result.remainingSeconds).toBe(0);
  });

  it('sets input fields to "00"', () => {
    const result = getDefaultTimerData();
    expect(result.inputHours).toBe('00');
    expect(result.inputMinutes).toBe('00');
    expect(result.inputSeconds).toBe('00');
  });
});

describe('emptyNotification', () => {
  it('has title and body as empty strings', () => {
    expect(emptyNotification.title).toBe('');
    expect(emptyNotification.body).toBe('');
  });

  it('is a plain object with exactly two keys', () => {
    expect(Object.keys(emptyNotification)).toEqual(['title', 'body']);
  });
});

describe('emptyMediaInfo', () => {
  it('has title, artist, album as empty strings and duration_ms as 0', () => {
    expect(emptyMediaInfo.title).toBe('');
    expect(emptyMediaInfo.artist).toBe('');
    expect(emptyMediaInfo.album).toBe('');
    expect(emptyMediaInfo.duration_ms).toBe(0);
  });

  it('is a plain object with exactly four keys', () => {
    expect(Object.keys(emptyMediaInfo)).toEqual(['title', 'artist', 'album', 'duration_ms']);
  });
});

describe('exports have correct types', () => {
  it('getDefaultCountdown is a function', () => {
    expect(typeof getDefaultCountdown).toBe('function');
  });

  it('getDefaultTimerData is a function', () => {
    expect(typeof getDefaultTimerData).toBe('function');
  });

  it('emptyNotification is an object', () => {
    expect(typeof emptyNotification).toBe('object');
    expect(emptyNotification).not.toBeNull();
  });

  it('emptyMediaInfo is an object', () => {
    expect(typeof emptyMediaInfo).toBe('object');
    expect(emptyMediaInfo).not.toBeNull();
  });
});
