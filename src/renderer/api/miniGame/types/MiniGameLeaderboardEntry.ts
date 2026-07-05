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
 * @file MiniGameLeaderboardEntry.ts
 * @description 小游戏排行榜条目数据结构定义
 * @author 鸡哥
 */

/** 小游戏排行榜条目 */
export interface MiniGameLeaderboardEntry {
  /** 排名 */
  rank: number;
  /** 用户ID */
  userId: number;
  /** 用户名 */
  username?: string;
  /** 头像URL */
  avatar?: string | null;
  /** 是否为Pro用户 */
  isPro?: boolean;
  /** 最高分 */
  highScore: number;
  /** 最佳用时（毫秒） */
  bestDurationMs?: number;
  /** 最佳步数 */
  bestMoves?: number;
}
