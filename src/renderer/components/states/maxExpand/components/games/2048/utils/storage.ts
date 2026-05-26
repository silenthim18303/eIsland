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
 * @file storage.ts
 * @description 2048 本地存档读写工具。
 * @author 鸡哥
 */

import { STORAGE_KEY } from '../config/constants';
import type { SavedState } from '../config/types';

/**
 * 保存 2048 当前状态到本地。
 */
export function saveState(s: SavedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

/**
 * 读取并校验 2048 本地状态。
 */
export function loadState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SavedState;
    if (!Array.isArray(s.tiles)) return null;
    if (typeof s.score !== 'number' || typeof s.best !== 'number') return null;
    if (typeof s.moveCount !== 'number' || typeof s.startTime !== 'number') return null;
    if (typeof s.tileSeq !== 'number' || typeof s.randomState !== 'number') return null;
    return s;
  } catch {
    return null;
  }
}

/**
 * 清除 2048 本地状态。
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
