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
 * @file performanceSettings.ts
 * @description MaxExpand 性能模式设置相关常量与工具函数。
 * @author 鸡哥
 */

export const MAXEXPAND_PERFORMANCE_MODE_STORE_KEY = 'maxexpand-performance-mode-enabled';
export const MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY = 'eIsland:maxexpand-performance-mode-enabled';
export const DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED = true;

/**
 * 将任意存储值标准化为性能模式开关状态。
 */
export function normalizeMaxExpandPerformanceModeEnabled(value: unknown): boolean {
  return value !== false;
}

/**
 * 从本地缓存读取性能模式开关值。
 */
export function readCachedMaxExpandPerformanceModeEnabled(): boolean {
  try {
    const cached = window.localStorage.getItem(MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY);
    if (cached === 'false') return false;
    if (cached === 'true') return true;
  } catch {
    return DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED;
  }
  return DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED;
}

/**
 * 写入本地缓存中的性能模式开关值。
 */
export function cacheMaxExpandPerformanceModeEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY, String(enabled));
  } catch {
  }
}
