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
 * @file pomodoroSlice.test.ts
 * @description 单元测试文件
 * @author 鸡哥
 */

import type { StateCreator } from 'zustand';
import { describe, expect, it } from 'vitest';
import { createPomodoroSlice } from '../pomodoroSlice';

type PomodoroState = ReturnType<typeof createPomodoroSlice>;

function createSliceState(creator: StateCreator<PomodoroState, [], [], PomodoroState>): { getState: () => PomodoroState } {
  let state = {} as PomodoroState;
  const setState = (updater: Partial<PomodoroState> | ((prev: PomodoroState) => Partial<PomodoroState>)) => {
    const patch = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...patch };
  };
  state = creator(setState as never, (() => state) as never, {} as never);
  return { getState: () => state };
}

describe('createPomodoroSlice', () => {
  it('applies expected default state', () => {
    const store = createSliceState(createPomodoroSlice);
    const state = store.getState();

    expect(state.pomodoroPhase).toBe('work');
    expect(state.pomodoroRemaining).toBe(1500);
    expect(state.pomodoroRunning).toBe(false);
    expect(state.pomodoroCompletedCount).toBe(0);
  });

  it('updates all fields through setters', () => {
    const store = createSliceState(createPomodoroSlice);
    const before = store.getState();

    before.setPomodoroPhase('shortBreak');
    before.setPomodoroRemaining(300);
    before.setPomodoroRunning(true);
    before.setPomodoroCompletedCount(2);

    const after = store.getState();
    expect(after.pomodoroPhase).toBe('shortBreak');
    expect(after.pomodoroRemaining).toBe(300);
    expect(after.pomodoroRunning).toBe(true);
    expect(after.pomodoroCompletedCount).toBe(2);
  });
});
