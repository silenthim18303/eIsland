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
 * @file tabNavigation.ts
 * @description MaxExpand 顶层 Tab 键盘切换顺序计算工具。
 * @author 鸡哥
 */

import type { NavDotId } from '../config/shellConstants';

/**
 * 获取当前导航点相邻的导航点。
 * @param navDots - 当前可见导航点列表。
 * @param currentId - 当前导航点 ID。
 * @param direction - 切换方向，1 为下一个，-1 为上一个。
 * @returns 目标导航点；没有可用导航点时返回 null。
 */
export function getAdjacentNavDotId(
  navDots: readonly NavDotId[],
  currentId: NavDotId,
  direction: 1 | -1,
): NavDotId | null {
  if (navDots.length === 0) return null;

  const currentIndex = navDots.indexOf(currentId);
  if (currentIndex < 0) return direction > 0 ? navDots[0] : navDots[navDots.length - 1];

  const nextIndex = (currentIndex + direction + navDots.length) % navDots.length;
  return navDots[nextIndex];
}