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
 * @file agentMode.test.ts
 * @description agentMode.ts 单元测试
 * @author 鸡哥
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ---------- mock config constants ---------- */

const STORAGE_KEY = 'eIsland_agentMode';
const VALID_MODES = new Set(['mihtnelis', 'r1pxc', 'edoc']);

vi.mock('../config/agentContentConfig', () => ({
  AGENT_MODE_STORAGE_KEY: STORAGE_KEY,
  VALID_AGENT_MODES: VALID_MODES,
}));

/* ---------- localStorage mock ---------- */

let store: Record<string, string>;

function mockLocalStorage(): void {
  store = {};
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { store = {}; }),
    },
    writable: true,
    configurable: true,
  });
}

/* ---------- import after mock ---------- */

let loadAgentMode: () => string;

beforeEach(async () => {
  mockLocalStorage();
  vi.resetModules();
  ({ loadAgentMode } = await import('../agentMode'));
});

/* ---------- tests ---------- */

describe('loadAgentMode', () => {
  it('returns default "mihtnelis" when localStorage is empty', () => {
    expect(loadAgentMode()).toBe('mihtnelis');
  });

  it('returns stored value when it is a valid mode', () => {
    store[STORAGE_KEY] = 'r1pxc';
    expect(loadAgentMode()).toBe('r1pxc');
  });

  it('returns "edoc" when stored value is "edoc"', () => {
    store[STORAGE_KEY] = 'edoc';
    expect(loadAgentMode()).toBe('edoc');
  });

  it('returns "mihtnelis" when stored value is "mihtnelis"', () => {
    store[STORAGE_KEY] = 'mihtnelis';
    expect(loadAgentMode()).toBe('mihtnelis');
  });

  it('returns default "mihtnelis" when stored value is not in valid set', () => {
    store[STORAGE_KEY] = 'invalid_mode';
    expect(loadAgentMode()).toBe('mihtnelis');
  });

  it('returns default "mihtnelis" when stored value is empty string', () => {
    store[STORAGE_KEY] = '';
    expect(loadAgentMode()).toBe('mihtnelis');
  });

  it('returns default "mihtnelis" when localStorage.getItem throws', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn(() => { throw new Error('storage disabled'); }),
      },
      writable: true,
      configurable: true,
    });
    expect(loadAgentMode()).toBe('mihtnelis');
  });

  it('reads from the correct storage key', () => {
    store[STORAGE_KEY] = 'r1pxc';
    loadAgentMode();
    expect(globalThis.localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });
});
