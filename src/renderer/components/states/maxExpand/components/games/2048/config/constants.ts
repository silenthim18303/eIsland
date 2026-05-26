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
 * @file constants.ts
 * @description 2048 游戏常量配置。
 * @author 鸡哥
 */

export const SIZE = 4;
export const CELL = 64;
export const GAP = 7;
export const PAD = 8;
export const BOARD = SIZE * CELL + (SIZE - 1) * GAP + 2 * PAD;
export const SLIDE_MS = 120;

export const STORAGE_KEY = 'island_game_2048_state';
