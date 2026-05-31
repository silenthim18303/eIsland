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
 * @file performanceSettings.test.ts
 * @description 性能模式设置工具函数单元测试
 * @author 鸡哥
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- localStorage mock ---------- */

let store: Record<string, string>;

function mockLocalStorage(): void {
  store = {};
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { store = {}; }),
    },
    writable: true,
    configurable: true,
  });

  // The source accesses window.localStorage — stub globalThis.window
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: globalThis.localStorage },
    configurable: true,
  });
}

/* ---------- import after mock ---------- */

let normalizeMaxExpandPerformanceModeEnabled: (value: unknown) => boolean;
let readCachedMaxExpandPerformanceModeEnabled: () => boolean;
let cacheMaxExpandPerformanceModeEnabled: (enabled: boolean) => void;
let MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY: string;
let MAXEXPAND_PERFORMANCE_MODE_STORE_KEY: string;
let DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED: boolean;

beforeEach(async () => {
  mockLocalStorage();
  vi.resetModules();
  const mod = await import('../performanceSettings');
  normalizeMaxExpandPerformanceModeEnabled = mod.normalizeMaxExpandPerformanceModeEnabled;
  readCachedMaxExpandPerformanceModeEnabled = mod.readCachedMaxExpandPerformanceModeEnabled;
  cacheMaxExpandPerformanceModeEnabled = mod.cacheMaxExpandPerformanceModeEnabled;
  MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY = mod.MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY;
  MAXEXPAND_PERFORMANCE_MODE_STORE_KEY = mod.MAXEXPAND_PERFORMANCE_MODE_STORE_KEY;
  DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED = mod.DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED;
});

/* ---------- tests ---------- */

describe('performanceSettings', () => {
  /* ================================================================ */
  /*  Constants                                                        */
  /* ================================================================ */

  describe('constants', () => {
    it('exports the expected store key', () => {
      expect(MAXEXPAND_PERFORMANCE_MODE_STORE_KEY).toBe('maxexpand-performance-mode-enabled');
    });

    it('exports the expected cache key', () => {
      expect(MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY).toBe('eIsland:maxexpand-performance-mode-enabled');
    });

    it('exports the expected default value (true)', () => {
      expect(DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED).toBe(true);
    });
  });

  /* ================================================================ */
  /*  normalizeMaxExpandPerformanceModeEnabled                         */
  /* ================================================================ */

  describe('normalizeMaxExpandPerformanceModeEnabled', () => {
    it('returns false only when value is strictly false', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled(false)).toBe(false);
    });

    it('returns true for true', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled(true)).toBe(true);
    });

    it('returns true for undefined', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled(undefined)).toBe(true);
    });

    it('returns true for null', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled(null)).toBe(true);
    });

    it('returns true for 0 (falsy but not false)', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled(0)).toBe(true);
    });

    it('returns true for empty string (falsy but not false)', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled('')).toBe(true);
    });

    it('returns true for string "false"', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled('false')).toBe(true);
    });

    it('returns true for string "true"', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled('true')).toBe(true);
    });

    it('returns true for number 1', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled(1)).toBe(true);
    });

    it('returns true for an object', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled({})).toBe(true);
    });

    it('returns true for an array', () => {
      expect(normalizeMaxExpandPerformanceModeEnabled([])).toBe(true);
    });
  });

  /* ================================================================ */
  /*  readCachedMaxExpandPerformanceModeEnabled                        */
  /* ================================================================ */

  describe('readCachedMaxExpandPerformanceModeEnabled', () => {
    it('returns true when cached value is "true"', () => {
      store[MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY] = 'true';
      expect(readCachedMaxExpandPerformanceModeEnabled()).toBe(true);
    });

    it('returns false when cached value is "false"', () => {
      store[MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY] = 'false';
      expect(readCachedMaxExpandPerformanceModeEnabled()).toBe(false);
    });

    it('returns default (true) when no cached value exists', () => {
      expect(readCachedMaxExpandPerformanceModeEnabled()).toBe(DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED);
    });

    it('returns default (true) when cached value is an unexpected string', () => {
      store[MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY] = 'yes';
      expect(readCachedMaxExpandPerformanceModeEnabled()).toBe(DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED);
    });

    it('returns default (true) when cached value is empty string', () => {
      store[MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY] = '';
      expect(readCachedMaxExpandPerformanceModeEnabled()).toBe(DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED);
    });

    it('returns default (true) when localStorage.getItem throws', () => {
      const getItemMock = globalThis.localStorage.getItem as ReturnType<typeof vi.fn>;
      getItemMock.mockImplementationOnce(() => {
        throw new Error('SecurityError');
      });
      expect(readCachedMaxExpandPerformanceModeEnabled()).toBe(DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED);
    });

    it('reads using the correct cache key', () => {
      readCachedMaxExpandPerformanceModeEnabled();
      expect(globalThis.localStorage.getItem).toHaveBeenCalledWith(MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY);
    });
  });

  /* ================================================================ */
  /*  cacheMaxExpandPerformanceModeEnabled                             */
  /* ================================================================ */

  describe('cacheMaxExpandPerformanceModeEnabled', () => {
    it('writes "true" to localStorage when enabled is true', () => {
      cacheMaxExpandPerformanceModeEnabled(true);
      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(
        MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY,
        'true',
      );
      expect(store[MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY]).toBe('true');
    });

    it('writes "false" to localStorage when enabled is false', () => {
      cacheMaxExpandPerformanceModeEnabled(false);
      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(
        MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY,
        'false',
      );
      expect(store[MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY]).toBe('false');
    });

    it('uses the correct cache key', () => {
      cacheMaxExpandPerformanceModeEnabled(true);
      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(
        MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY,
        expect.any(String),
      );
    });

    it('does not throw when localStorage.setItem throws', () => {
      const setItemMock = globalThis.localStorage.setItem as ReturnType<typeof vi.fn>;
      setItemMock.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });
      expect(() => cacheMaxExpandPerformanceModeEnabled(true)).not.toThrow();
    });
  });

  /* ================================================================ */
  /*  Round-trip: cache then read                                      */
  /* ================================================================ */

  describe('round-trip consistency', () => {
    it('cached true can be read back as true', () => {
      cacheMaxExpandPerformanceModeEnabled(true);
      expect(readCachedMaxExpandPerformanceModeEnabled()).toBe(true);
    });

    it('cached false can be read back as false', () => {
      cacheMaxExpandPerformanceModeEnabled(false);
      expect(readCachedMaxExpandPerformanceModeEnabled()).toBe(false);
    });
  });
});
