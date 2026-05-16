import type { StateCreator } from 'zustand';
import { describe, expect, it } from 'vitest';
import { emptyMediaInfo } from '../../constants/defaults';
import { createMediaSlice } from '../mediaSlice';

type MediaState = ReturnType<typeof createMediaSlice>;

function createSliceState(creator: StateCreator<MediaState, [], [], MediaState>): { getState: () => MediaState } {
  let state = {} as MediaState;
  const setState = (updater: Partial<MediaState> | ((prev: MediaState) => Partial<MediaState>)) => {
    const patch = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...patch };
  };
  state = creator(setState as never, (() => state) as never, {} as never);
  return { getState: () => state };
}

describe('createMediaSlice', () => {
  it('resets media state when lrc update is null', () => {
    const store = createSliceState(createMediaSlice);
    store.getState().updateLrcData({
      title: 't',
      artist: 'a',
      text: 'lyric',
      position_ms: 10,
      duration_ms: 20,
      nearby_o3ics: [{ text: 'line', is_current: false }],
    });

    store.getState().updateLrcData(null);

    const after = store.getState();
    expect(after.isMusicPlaying).toBe(false);
    expect(after.isPlaying).toBe(false);
    expect(after.currentLyricText).toBeNull();
    expect(after.nearbyLyrics).toEqual([]);
  });

  it('updates core fields on media changed', () => {
    const store = createSliceState(createMediaSlice);

    store.getState().onMediaChanged({
      title: 'Song',
      artist: 'Singer',
      duration_ms: 200000,
      thumbnail: 'cover-url',
    });

    const after = store.getState();
    expect(after.isMusicPlaying).toBe(true);
    expect(after.mediaInfo.title).toBe('Song');
    expect(after.mediaInfo.artist).toBe('Singer');
    expect(after.currentDurationMs).toBe(200000);
    expect(after.currentPositionMs).toBe(0);
    expect(after.coverImage).toBe('cover-url');
  });

  it('clears now-playing when payload is empty', () => {
    const store = createSliceState(createMediaSlice);

    store.getState().handleNowPlayingUpdate({
      title: 'Song',
      artist: 'Singer',
      album: 'Album',
      duration_ms: 120000,
      position_ms: 1000,
      isPlaying: true,
      thumbnail: 'thumb',
    } as never);

    store.getState().handleNowPlayingUpdate(null);

    const after = store.getState();
    expect(after.isMusicPlaying).toBe(false);
    expect(after.isPlaying).toBe(false);
    expect(after.mediaInfo).toEqual(emptyMediaInfo);
    expect(after.currentDurationMs).toBe(0);
    expect(after.currentPositionMs).toBe(0);
    expect(after.coverImage).toBeNull();
  });
});
