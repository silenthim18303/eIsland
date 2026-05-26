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
 * @description 2048 游戏类型定义。
 * @author 鸡哥
 */

export interface TileData { id: number; value: number; row: number; col: number; }

export interface MergeInfo { survivorId: number; absorbedId: number; newValue: number; }

export interface MoveResult { tiles: TileData[]; merges: MergeInfo[]; scoreGained: number; moved: boolean; }

export type Dir = 'left' | 'right' | 'up' | 'down';

export interface Game2048Session { sessionId: string; seed: number; startedAt: number; }

export interface Game2048EndPayload {
  score: number;
  durationMs: number;
  moves: number;
  achievedAt: number;
  sessionId?: string;
  moveTrace?: string;
}

export interface Game2048State { score: number; best: number; over: boolean; moveCount: number; }

export interface Game2048Handle { newGame: (session?: Game2048Session | null) => void; }

export interface Game2048Props {
  onGameEnd?: (payload: Game2048EndPayload) => void;
  onStateChange?: (state: Game2048State) => void;
  activeSession?: Game2048Session | null;
}

export interface SavedState {
  tiles: TileData[];
  score: number;
  best: number;
  moveCount: number;
  startTime: number;
  tileSeq: number;
  moveTrace: string;
  randomState: number;
}

export interface InitialGame2048State {
  tiles: TileData[];
  score: number;
  best: number;
  moveCount: number;
  startTime: number;
  moveTrace: string;
  randomState: number;
}
