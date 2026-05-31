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
 * @file index.test.ts
 * @description Zustand Store 聚合模块单元测试
 * @author 鸡哥
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockCreateIslandSlice,
  mockCreateWeatherSlice,
  mockCreateTimerSlice,
  mockCreateNotificationSlice,
  mockCreateMediaSlice,
  mockCreateAiSlice,
  mockCreatePomodoroSlice,
  mockCreate,
} = vi.hoisted(() => ({
  mockCreateIslandSlice: vi.fn(),
  mockCreateWeatherSlice: vi.fn(),
  mockCreateTimerSlice: vi.fn(),
  mockCreateNotificationSlice: vi.fn(),
  mockCreateMediaSlice: vi.fn(),
  mockCreateAiSlice: vi.fn(),
  mockCreatePomodoroSlice: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock('zustand', () => ({
  create: mockCreate,
}));

vi.mock('../islandSlice', () => ({
  createIslandSlice: mockCreateIslandSlice,
}));

vi.mock('../weatherSlice', () => ({
  createWeatherSlice: mockCreateWeatherSlice,
}));

vi.mock('../timerSlice', () => ({
  createTimerSlice: mockCreateTimerSlice,
}));

vi.mock('../notificationSlice', () => ({
  createNotificationSlice: mockCreateNotificationSlice,
}));

vi.mock('../mediaSlice', () => ({
  createMediaSlice: mockCreateMediaSlice,
}));

vi.mock('../aiSlice', () => ({
  createAiSlice: mockCreateAiSlice,
}));

vi.mock('../pomodoroSlice', () => ({
  createPomodoroSlice: mockCreatePomodoroSlice,
}));

describe('useIslandStore (index.ts aggregator)', () => {
  let storeFactory: ReturnType<typeof vi.fn>;
  let capturedArgs: { set: unknown; get: unknown; store: unknown };

  beforeEach(() => {
    capturedArgs = { set: undefined, get: undefined, store: undefined };

    // Each slice returns a distinct object of properties
    mockCreateIslandSlice.mockReturnValue({ state: 'idle', setIdle: vi.fn() });
    mockCreateWeatherSlice.mockReturnValue({ weather: null, fetchWeatherData: vi.fn() });
    mockCreateTimerSlice.mockReturnValue({ countdown: {}, setCountdown: vi.fn() });
    mockCreateNotificationSlice.mockReturnValue({ notification: null });
    mockCreateMediaSlice.mockReturnValue({ isMusicPlaying: false, setPlaybackState: vi.fn() });
    mockCreateAiSlice.mockReturnValue({ aiConfig: {}, setAiConfig: vi.fn() });
    mockCreatePomodoroSlice.mockReturnValue({ pomodoroPhase: 'work', setPomodoroPhase: vi.fn() });

    // create() returns a curried function: create<IStore>()(factory)
    // The first call returns a second function that accepts the factory and invokes it.
    storeFactory = vi.fn((factory: (set: unknown, get: unknown, store: unknown) => unknown) => {
      const mockSet = vi.fn();
      const mockGet = vi.fn();
      const mockStore = {};
      capturedArgs = { set: mockSet, get: mockGet, store: mockStore };
      return factory(mockSet, mockGet, mockStore);
    });
    mockCreate.mockReturnValue(storeFactory);

    // Force module re-execution on each test so mock call counts reflect current test
    vi.resetModules();
  });

  it('calls zustand create with curried invocation', async () => {
    await import('../index');
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(storeFactory).toHaveBeenCalledTimes(1);
  });

  it('invokes all seven slice creators', async () => {
    await import('../index');
    expect(mockCreateIslandSlice).toHaveBeenCalledTimes(1);
    expect(mockCreateWeatherSlice).toHaveBeenCalledTimes(1);
    expect(mockCreateTimerSlice).toHaveBeenCalledTimes(1);
    expect(mockCreateNotificationSlice).toHaveBeenCalledTimes(1);
    expect(mockCreateMediaSlice).toHaveBeenCalledTimes(1);
    expect(mockCreateAiSlice).toHaveBeenCalledTimes(1);
    expect(mockCreatePomodoroSlice).toHaveBeenCalledTimes(1);
  });

  it('passes set, get, and store arguments to every slice creator', async () => {
    await import('../index');

    const allMocks = [
      mockCreateIslandSlice,
      mockCreateWeatherSlice,
      mockCreateTimerSlice,
      mockCreateNotificationSlice,
      mockCreateMediaSlice,
      mockCreateAiSlice,
      mockCreatePomodoroSlice,
    ];

    for (const sliceMock of allMocks) {
      const args = sliceMock.mock.calls[0];
      expect(args).toHaveLength(3);
      expect(args[0]).toBe(capturedArgs.set);
      expect(args[1]).toBe(capturedArgs.get);
      expect(args[2]).toBe(capturedArgs.store);
    }
  });

  it('merges all slice properties into a single store object', async () => {
    const storeModule = await import('../index');
    const useIslandStore = storeModule.default;

    expect(useIslandStore).toEqual(
      expect.objectContaining({
        // islandSlice
        state: 'idle',
        setIdle: expect.any(Function),
        // weatherSlice
        weather: null,
        fetchWeatherData: expect.any(Function),
        // timerSlice
        countdown: {},
        setCountdown: expect.any(Function),
        // notificationSlice
        notification: null,
        // mediaSlice
        isMusicPlaying: false,
        setPlaybackState: expect.any(Function),
        // aiSlice
        aiConfig: {},
        setAiConfig: expect.any(Function),
        // pomodoroSlice
        pomodoroPhase: 'work',
        setPomodoroPhase: expect.any(Function),
      }),
    );
  });

  it('returns an object with keys from all slices', async () => {
    const storeModule = await import('../index');
    const store = storeModule.default as Record<string, unknown>;
    const keys = Object.keys(store);

    // Island slice keys
    expect(keys).toContain('state');
    expect(keys).toContain('setIdle');
    // Weather slice keys
    expect(keys).toContain('weather');
    expect(keys).toContain('fetchWeatherData');
    // Timer slice keys
    expect(keys).toContain('countdown');
    expect(keys).toContain('setCountdown');
    // Notification slice keys
    expect(keys).toContain('notification');
    // Media slice keys
    expect(keys).toContain('isMusicPlaying');
    expect(keys).toContain('setPlaybackState');
    // AI slice keys
    expect(keys).toContain('aiConfig');
    expect(keys).toContain('setAiConfig');
    // Pomodoro slice keys
    expect(keys).toContain('pomodoroPhase');
    expect(keys).toContain('setPomodoroPhase');
  });

  it('exports useIslandStore as default export', async () => {
    const storeModule = await import('../index');
    expect(storeModule.default).toBeDefined();
  });

  it('handles slice returning extra properties without collision', async () => {
    mockCreateIslandSlice.mockReturnValue({ state: 'hover', uniqueIslandKey: true });
    mockCreateWeatherSlice.mockReturnValue({ weather: { temp: 25 }, uniqueWeatherKey: true });

    const storeModule = await import('../index');
    const store = storeModule.default as Record<string, unknown>;

    expect(store.uniqueIslandKey).toBe(true);
    expect(store.uniqueWeatherKey).toBe(true);
  });

  it('overwrites duplicate keys with later slices taking precedence', async () => {
    // If two slices return the same key, the later spread wins
    mockCreateIslandSlice.mockReturnValue({ sharedKey: 'island' });
    mockCreatePomodoroSlice.mockReturnValue({ sharedKey: 'pomodoro' });

    const storeModule = await import('../index');
    const store = storeModule.default as Record<string, unknown>;

    // pomodoroSlice is spread last, so its value should win
    expect(store.sharedKey).toBe('pomodoro');
  });

  it('works when a slice returns an empty object', async () => {
    mockCreateNotificationSlice.mockReturnValue({});
    mockCreateMediaSlice.mockReturnValue({});

    const storeModule = await import('../index');
    const store = storeModule.default as Record<string, unknown>;

    // Should still have keys from other slices
    expect(store).toHaveProperty('state');
    expect(store).toHaveProperty('weather');
  });

  it('each slice creator receives the identical set/get/store triplet', async () => {
    await import('../index');

    const allCalls = [
      mockCreateIslandSlice.mock.calls[0],
      mockCreateWeatherSlice.mock.calls[0],
      mockCreateTimerSlice.mock.calls[0],
      mockCreateNotificationSlice.mock.calls[0],
      mockCreateMediaSlice.mock.calls[0],
      mockCreateAiSlice.mock.calls[0],
      mockCreatePomodoroSlice.mock.calls[0],
    ];

    // All slices should receive the same set/get/store from the factory
    for (const [set, get, store] of allCalls) {
      expect(set).toBe(capturedArgs.set);
      expect(get).toBe(capturedArgs.get);
      expect(store).toBe(capturedArgs.store);
    }
  });
});
