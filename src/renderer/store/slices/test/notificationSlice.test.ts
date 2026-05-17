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
 * @file notificationSlice.test.ts
 * @description 单元测试文件
 * @author 鸡哥
 */

import type { StateCreator } from 'zustand';
import { describe, expect, it } from 'vitest';
import { emptyNotification } from '../../constants/defaults';
import { createNotificationSlice } from '../notificationSlice';

type NotificationState = ReturnType<typeof createNotificationSlice>;

function createSliceState(creator: StateCreator<NotificationState, [], [], NotificationState>): { getState: () => NotificationState } {
  let state = {} as NotificationState;
  const setState = (updater: NotificationState | ((prev: NotificationState) => Partial<NotificationState>)) => {
    const patch = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...patch };
  };
  state = creator(setState as never, (() => state) as never, {} as never);
  return { getState: () => state };
}

describe('createNotificationSlice', () => {
  it('initializes with empty notification defaults', () => {
    const store = createSliceState(createNotificationSlice);
    expect(store.getState().notification).toEqual(emptyNotification);
  });
});
