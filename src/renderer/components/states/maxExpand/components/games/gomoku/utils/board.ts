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
 * @file board.ts
 * @description 五子棋棋盘基础工具。
 * @author 鸡哥
 */

import { GOMOKU_SIZE } from '../config/types';

/**
 * 创建空棋盘。
 */
export function createGomokuBoard(): number[][] {
  return Array.from({ length: GOMOKU_SIZE }, () => Array.from({ length: GOMOKU_SIZE }, () => 0));
}

/**
 * 判断指定落子是否达成五连。
 */
export function isGomokuWin(board: number[][], row: number, col: number, piece: 1 | 2): boolean {
  const dirs: Array<[number, number]> = [[1, 0], [0, 1], [1, 1], [1, -1]];
  return dirs.some(([dx, dy]) => {
    let count = 1;
    for (let step = 1; step < 5; step += 1) {
      const nr = row + dx * step;
      const nc = col + dy * step;
      if (nr < 0 || nr >= GOMOKU_SIZE || nc < 0 || nc >= GOMOKU_SIZE || board[nr][nc] !== piece) {
        break;
      }
      count += 1;
    }
    for (let step = 1; step < 5; step += 1) {
      const nr = row - dx * step;
      const nc = col - dy * step;
      if (nr < 0 || nr >= GOMOKU_SIZE || nc < 0 || nc >= GOMOKU_SIZE || board[nr][nc] !== piece) {
        break;
      }
      count += 1;
    }
    return count >= 5;
  });
}
