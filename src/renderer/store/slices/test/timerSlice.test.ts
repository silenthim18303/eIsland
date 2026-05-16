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
