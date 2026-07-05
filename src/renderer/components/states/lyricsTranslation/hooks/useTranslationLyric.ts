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
 * @file useTranslationLyric.ts
 * @description 当前翻译歌词行文本 Hook
 * @author 鸡哥
 */

import { useMemo } from 'react';
import type { LyricLine } from '../../../../api/lyrics/lrcApi';
import { findCurrentIndex } from '../../lyrics/utils/findCurrentIndex';

/**
 * 根据当前播放位置查找对应的翻译歌词行文本。
 * @param translationLines - 翻译歌词行数组。
 * @param currentIdx - 原文歌词当前行索引（用于判断是否在播放中）。
 * @param currentPositionMs - 当前播放位置（毫秒）。
 * @returns 当前翻译歌词行文本，无匹配时返回空字符串。
 */
export function useTranslationLyric(
  translationLines: LyricLine[] | null,
  currentIdx: number,
  currentPositionMs: number,
): string {
  return useMemo(() => {
    if (!translationLines || translationLines.length === 0 || currentIdx < 0) return '';
    const tIdx = findCurrentIndex(translationLines, currentPositionMs);
    return tIdx >= 0 ? translationLines[tIdx].text : '';
  }, [translationLines, currentIdx, currentPositionMs]);
}
