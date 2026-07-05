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
 * @file translation.ts
 * @description 翻译歌词数据层状态工具
 * @author 鸡哥
 */

import type { LyricLine, TranslationLyricsResult } from './types';
import { parseSyncedLrc } from './helpers';

/** @returns 不支持翻译歌词的结果 */
export function unsupportedTranslationLyrics(): TranslationLyricsResult {
  return { status: 'unsupported', lines: null };
}

/** @returns 播放器未提供翻译歌词的结果 */
export function missingTranslationLyrics(): TranslationLyricsResult {
  return { status: 'not-provided', lines: null };
}

/** @returns 未获取到翻译歌词的结果 */
export function unresolvedTranslationLyrics(): TranslationLyricsResult {
  return { status: 'not-fetched', lines: null };
}

/**
 * 解析翻译歌词原始文本
 * @param raw - LRC 格式的翻译歌词文本
 * @returns 解析后的翻译歌词结果
 */
export function parseTranslationLyrics(raw: string | null | undefined): TranslationLyricsResult {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return missingTranslationLyrics();
  }

  const lines: LyricLine[] = parseSyncedLrc(raw);
  return lines.length > 0
    ? { status: 'available', lines }
    : unresolvedTranslationLyrics();
}