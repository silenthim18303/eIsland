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
 * @file MiniGameSubmitPayload.ts
 * @description 小游戏提交负载类型定义
 * @author 鸡哥
 */

/** 小游戏提交负载 */
export interface MiniGameSubmitPayload {
  /** 分数 */
  score: number;
  /** 用时（毫秒） */
  durationMs: number;
  /** 步数 */
  moves: number;
  /** 达成时间戳（毫秒） */
  achievedAt: number;
  /** 会话 ID */
  sessionId?: string;
  /** 移动轨迹 */
  moveTrace?: string;
}
