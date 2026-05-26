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
 * @description 五子棋类型定义。
 * @author 鸡哥
 */

export const GOMOKU_SIZE = 15;

export type GomokuAIDifficulty = 'novice' | 'easy' | 'hard' | 'expert' | 'master';
export type GomokuMovePosition = [number, number];

export interface GameGomokuState {
  board: number[][];
  turn: 1 | 2;
  winner: 1 | 2 | 0;
  moves: number;
  scale: number;
  lastMove: GomokuMovePosition | null;
  aiThinking?: boolean;
}

export interface GameGomokuHandle {
  restart: () => void;
}

export interface GameGomokuProps {
  storageKey?: string;
  onStateChange?: (state: GameGomokuState) => void;
  aiDifficulty?: GomokuAIDifficulty;
  highlightMove?: GomokuMovePosition | null;
  highlightPulse?: number;
  resultOverlayText?: string | null;
  boardAriaLabel: string;
  getCellAriaLabel: (row: number, col: number) => string;
}
