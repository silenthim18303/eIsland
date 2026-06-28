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
 * @file searchTypes.ts
 * @description 歌词搜索共享类型 — 搜索候选、评分输入
 * @author 鸡哥
 * @docs https://github.com/cXp1r/lyricify-lyrics-provider-rs
 */

/** 搜索候选歌曲（从搜索 API 提取的元数据） */
export interface SearchCandidate {
  /** 歌曲 ID（QQ Music 数字 id / Soda Music track id / Netease id / Kugou hash） */
  id: string;
  /** QQ Music songmid（可选） */
  mid?: string;
  /** 歌曲标题 */
  title: string;
  /** 艺术家列表 */
  artists: string[];
  /** 专辑名 */
  album: string;
  /** 时长（毫秒） */
  durationMs?: number;
}

/** 评分输入（当前播放歌曲的元数据） */
export interface ScoreInput {
  title: string;
  artist: string;
  album?: string;
  durationMs?: number;
}
