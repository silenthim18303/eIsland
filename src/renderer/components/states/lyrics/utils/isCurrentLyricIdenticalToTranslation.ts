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
 * @file isCurrentLyricIdenticalToTranslation.ts
 * @description 检查当前歌词行的原文与翻译是否完全一致。
 * @author 鸡哥
 */

import type { SyncedLyricLine } from '../../../../store/types';
import type { TranslationLyricsResult } from '../../../../api/lyrics/lrcApi';
import { findCurrentIndex } from './findCurrentIndex';

/**
 * 检查当前歌词行的原文与翻译是否完全一致。
 * @param syncedLyrics - 同步歌词行数组。
 * @param translationLyrics - 翻译歌词结果。
 * @param currentPositionMs - 当前播放位置（毫秒）。
 * @returns 原文与翻译完全一致时返回 true。
 */
export function isCurrentLyricIdenticalToTranslation(
  syncedLyrics: SyncedLyricLine[] | null,
  translationLyrics: TranslationLyricsResult | null,
  currentPositionMs: number,
): boolean {
  if (!syncedLyrics || !translationLyrics || translationLyrics.status !== 'available') return false;
  const tLines = translationLyrics.lines;
  if (!tLines || tLines.length === 0) return false;
  const origIdx = findCurrentIndex(syncedLyrics, currentPositionMs);
  if (origIdx < 0) return false;
  const tIdx = findCurrentIndex(tLines, currentPositionMs);
  if (tIdx < 0) return false;
  return syncedLyrics[origIdx].text === tLines[tIdx].text;
}
