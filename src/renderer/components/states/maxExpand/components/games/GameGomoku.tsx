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
 * @file GameGomoku.tsx
 * @description 五子棋小游戏实现：15x15 棋盘 + 本地存档 + 滚轮缩放
 * @author 鸡哥
 */

export { GameGomoku } from './gomoku';
export { GOMOKU_SIZE } from './gomoku';
export type {
  GomokuAIDifficulty,
  GameGomokuHandle,
  GameGomokuProps,
  GameGomokuState,
} from './gomoku';
