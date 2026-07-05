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
 * @file MiniGameScoreData.ts
 * @description 小游戏分数数据类型定义
 * @author 鸡哥
 */

/** 小游戏分数数据 */
export interface MiniGameScoreData {
  /** 游戏 ID */
  gameId: string;
  /** 用户 ID */
  userId: number;
  /** 最高分 */
  highScore: number;
  /** 最佳用时（毫秒） */
  bestDurationMs?: number;
  /** 最佳步数 */
  bestMoves?: number;
  /** 游戏次数 */
  playsCount?: number;
  /** 达成时间 */
  achievedAt?: string;
}
