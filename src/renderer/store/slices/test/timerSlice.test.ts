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
 * @file timerSlice.test.ts
 * @description 单元测试文件
 * @author 鸡哥
 */

import type { StateCreator } from 'zustand';
import { describe, expect, it } from 'vitest';
import { createTimerSlice } from '../timerSlice';

type TimerState = ReturnType<typeof createTimerSlice>;

function createSliceState(creator: StateCreator<TimerState, [], [], TimerState>): { getState: () => TimerState } {
  let state = {} as TimerState;

  const setState = (updater: Partial<TimerState> | ((prev: TimerState) => Partial<TimerState>)) => {
    const patch = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...patch };
  };

  state = creator(setState as never, (() => state) as never, {} as never);

  return {
    getState: () => state,
  };
}

describe('createTimerSlice', () => {
  it('merges countdown fields when setCountdown is called', () => {
    const store = createSliceState(createTimerSlice);
    const before = store.getState();

    before.setCountdown({
      label: '考试',
      enabled: false,
    });

    const after = store.getState();
    expect(after.countdown.label).toBe('考试');
    expect(after.countdown.enabled).toBe(false);
    expect(after.countdown.targetDate).toBe(before.countdown.targetDate);
  });

  it('partially updates timerData and keeps untouched fields', () => {
    const store = createSliceState(createTimerSlice);

    store.getState().setTimerData({
      state: 'running',
      remainingSeconds: 120,
      inputMinutes: '02',
    });

    const after = store.getState();
    expect(after.timerData.state).toBe('running');
    expect(after.timerData.remainingSeconds).toBe(120);
    expect(after.timerData.inputMinutes).toBe('02');
    expect(after.timerData.inputHours).toBe('00');
    expect(after.timerData.inputSeconds).toBe('00');
  });
});
