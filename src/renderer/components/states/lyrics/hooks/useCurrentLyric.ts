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
 * @file useCurrentLyric.ts
 * @description 当前歌词行索引与行数据 Hook
 * @author 鸡哥
 */

import { useMemo } from 'react';
import type { SyncedLyricLine } from '../../../../store/types';
import { findCurrentIndex } from '../utils/findCurrentIndex';

interface UseCurrentLyricResult {
  currentIdx: number;
  hasLyrics: boolean;
  isIntro: boolean;
  currentLine: SyncedLyricLine | null;
  currentText: string;
  hasSyllables: boolean;
}

/**
 * 计算当前歌词行索引、行文本与逐字音节状态。
 * @param syncedLyrics - 同步歌词数据。
 * @param lyricsLoading - 歌词是否加载中。
 * @param currentPositionMs - 当前播放位置（毫秒）。
 * @returns 当前行索引、行数据及派生状态。
 */
export function useCurrentLyric(
  syncedLyrics: SyncedLyricLine[] | null,
  lyricsLoading: boolean,
  currentPositionMs: number,
): UseCurrentLyricResult {
  const hasLyrics = Boolean(syncedLyrics && syncedLyrics.length > 0 && !lyricsLoading);

  const currentIdx = useMemo(() => {
    if (!syncedLyrics || syncedLyrics.length === 0) return -1;
    return findCurrentIndex(syncedLyrics, currentPositionMs);
  }, [syncedLyrics, currentPositionMs]);

  const isIntro = hasLyrics && currentIdx < 0;

  const currentLine = useMemo(() => {
    if (!hasLyrics || isIntro) return null;
    if (currentIdx >= 0 && syncedLyrics && currentIdx < syncedLyrics.length) {
      return syncedLyrics[currentIdx];
    }
    return null;
  }, [hasLyrics, isIntro, currentIdx, syncedLyrics]);

  const currentText = currentLine?.text ?? '';

  const hasSyllables = Boolean(
    currentLine && currentLine.syllables && currentLine.syllables.length > 0,
  );

  return { currentIdx, hasLyrics, isIntro, currentLine, currentText, hasSyllables };
}
