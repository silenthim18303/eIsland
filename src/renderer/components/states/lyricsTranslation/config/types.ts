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
 * @file types.ts
 * @description 带翻译歌词状态类型定义
 * @author 鸡哥
 */

import type { SyncedLyricLine } from '../../../../store/types';

/** 带翻译歌词状态视图组件 Props */
export interface LyricsTranslationContentViewProps {
  /** 当前播放位置（毫秒） */
  currentPositionMs: number;
  /** 歌词是否加载中 */
  lyricsLoading: boolean;
  /** 是否正在播放音乐 */
  isMusicPlaying: boolean;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 专辑封面 */
  coverImage: string | null;
  /** 主色调 */
  dominantColor: [number, number, number];
  /** 外发光效果是否启用 */
  glowEnabled: boolean;
  /** 北京时钟文本 */
  clockText: string | null;
  /** 时钟是否启用 */
  clockEnabled: boolean;
  /** 是否为前奏阶段 */
  isIntro: boolean;
  /** 媒体标题（前奏时显示） */
  mediaTitle: string;
  /** 当前行索引 */
  currentIdx: number;
  /** 当前行文本 */
  currentText: string;
  /** 当前行数据 */
  currentLine: SyncedLyricLine | null;
  /** 是否有逐字音节 */
  hasSyllables: boolean;
  /** 逐字歌词是否启用 */
  karaokeEnabled: boolean;
  /** 翻译歌词行文本 */
  translationText: string;
}
