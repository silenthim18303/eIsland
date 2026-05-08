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
 * @file useIslandStateBridges.ts
 * @description 灵动岛状态桥接逻辑 Hook。
 * @author 鸡哥
 */

import { useEffect } from 'react';
import type { SyncedLyricLine, TimerState } from '../../store/types';
import type { IslandState } from './useDynamicIslandShell';

interface UseIslandStateBridgesOptions {
  state: IslandState;
  timerState: TimerState;
  isPlaying: boolean;
  syncedLyrics: SyncedLyricLine[] | null;
  lyricsLoading: boolean;
  setLyrics: () => void;
  setAgentVoiceInput: () => void;
  setIdle: (force?: boolean) => void;
}

/**
 * @description 处理语音输入状态与歌词状态桥接。
 * @param options - 状态桥接配置。
 */
export function useIslandStateBridges(options: UseIslandStateBridgesOptions): void {
  const {
    state,
    timerState,
    isPlaying,
    syncedLyrics,
    lyricsLoading,
    setLyrics,
    setAgentVoiceInput,
    setIdle,
  } = options;

  useEffect(() => {
    const unsub = window.api?.onAgentVoiceInputState?.((active: boolean) => {
      if (active) {
        setAgentVoiceInput();
      } else {
        setIdle(true);
      }
    });
    return () => { unsub?.(); };
  }, [setAgentVoiceInput, setIdle]);

  useEffect(() => {
    if (state !== 'idle') return;
    if (timerState !== 'idle') return;
    if (isPlaying && ((syncedLyrics?.length ?? 0) > 0 || lyricsLoading)) {
      setLyrics();
    }
  }, [state, timerState, isPlaying, syncedLyrics, lyricsLoading, setLyrics]);
}
