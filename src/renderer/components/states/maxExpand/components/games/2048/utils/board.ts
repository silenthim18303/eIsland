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
 * @description 2048 棋盘核心计算逻辑。
 * @author 鸡哥
 */

import { SIZE } from '../config/constants';
import type { Dir, InitialGame2048State, MergeInfo, MoveResult, TileData } from '../config/types';
import { loadState } from './storage';
import { DeterministicRandom } from './random';

let tileSeq = 1;

/**
 * 获取当前方块序列号。
 */
export function getTileSeq(): number {
  return tileSeq;
}

/**
 * 设置方块序列号。
 */
export function setTileSeq(value: number): void {
  tileSeq = value;
}

function emptyPos(tiles: TileData[]): Array<[number, number]> {
  const used = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const r: Array<[number, number]> = [];
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (!used.has(`${i},${j}`)) r.push([i, j]);
    }
  }
  return r;
}

/**
 * 在空位生成新方块。
 */
export function spawn(tiles: TileData[], random: DeterministicRandom): TileData | null {
  const e = emptyPos(tiles);
  if (!e.length) return null;
  const [row, col] = e[random.nextInt(e.length)];
  return { id: tileSeq++, value: random.nextDouble() < 0.9 ? 2 : 4, row, col };
}

/**
 * 计算一次方向移动结果。
 */
export function computeMove(tiles: TileData[], dir: Dir): MoveResult {
  const horiz = dir === 'left' || dir === 'right';
  const rev = dir === 'right' || dir === 'down';
  const lines: Map<number, TileData[]> = new Map();
  tiles.forEach((t) => {
    const k = horiz ? t.row : t.col;
    if (!lines.has(k)) lines.set(k, []);
    lines.get(k)!.push({ ...t });
  });
  const result: TileData[] = [];
  const merges: MergeInfo[] = [];
  let scoreGained = 0;
  for (let ln = 0; ln < SIZE; ln++) {
    const arr = lines.get(ln) || [];
    arr.sort((a, b) => {
      const pa = horiz ? a.col : a.row;
      const pb = horiz ? b.col : b.row;
      return rev ? pb - pa : pa - pb;
    });
    let target = rev ? SIZE - 1 : 0;
    const step = rev ? -1 : 1;
    let i = 0;
    while (i < arr.length) {
      const cur = arr[i];
      if (i + 1 < arr.length && arr[i + 1].value === cur.value) {
        const nxt = arr[i + 1];
        const nv = cur.value * 2;
        scoreGained += nv;
        if (horiz) {
          cur.col = target;
          nxt.col = target;
        } else {
          cur.row = target;
          nxt.row = target;
        }
        merges.push({ survivorId: cur.id, absorbedId: nxt.id, newValue: nv });
        result.push(cur, nxt);
        target += step;
        i += 2;
      } else {
        if (horiz) cur.col = target;
        else cur.row = target;
        result.push(cur);
        target += step;
        i += 1;
      }
    }
  }
  const moved = tiles.some((o) => {
    const u = result.find((t) => t.id === o.id);
    return u && (u.row !== o.row || u.col !== o.col);
  });
  return { tiles: result, merges, scoreGained, moved };
}

/**
 * 判断棋盘是否仍可移动。
 */
export function canMove(tiles: TileData[]): boolean {
  return (['left', 'right', 'up', 'down'] as Dir[]).some((d) => computeMove(tiles, d).moved);
}

/**
 * 初始化开局方块。
 */
export function initTiles(random: DeterministicRandom): TileData[] {
  tileSeq = 1;
  const t1 = spawn([], random)!;
  const arr = [t1];
  const t2 = spawn(arr, random);
  if (t2) arr.push(t2);
  return arr;
}

/**
 * 创建初始游戏状态（优先恢复存档）。
 */
export function createInitial(): InitialGame2048State {
  const saved = loadState();
  if (saved) {
    setTileSeq(saved.tileSeq);
    return {
      tiles: saved.tiles,
      score: saved.score,
      best: saved.best,
      moveCount: saved.moveCount,
      startTime: saved.startTime,
      moveTrace: saved.moveTrace ?? '',
      randomState: saved.randomState >>> 0,
    };
  }
  const random = new DeterministicRandom(1);
  return {
    tiles: initTiles(random),
    score: 0,
    best: 0,
    moveCount: 0,
    startTime: 0,
    moveTrace: '',
    randomState: random.getState(),
  };
}
