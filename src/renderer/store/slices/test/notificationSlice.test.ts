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
