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
 * @file tabNavigation.test.ts
 * @description MaxExpand 顶层 Tab 键盘切换顺序计算单元测试。
 * @author 鸡哥
 */

import { describe, expect, it } from 'vitest';
import type { NavDotId } from '../../config/shellConstants';
import { getAdjacentNavDotId } from '../tabNavigation';

const NAV_DOTS: NavDotId[] = ['expanded', 'todo', 'album', 'settings'];

describe('getAdjacentNavDotId', () => {
  it('returns the next nav dot when direction is forward', () => {
    expect(getAdjacentNavDotId(NAV_DOTS, 'todo', 1)).toBe('album');
  });

  it('returns the previous nav dot when direction is backward', () => {
    expect(getAdjacentNavDotId(NAV_DOTS, 'todo', -1)).toBe('expanded');
  });

  it('wraps around at both ends', () => {
    expect(getAdjacentNavDotId(NAV_DOTS, 'settings', 1)).toBe('expanded');
    expect(getAdjacentNavDotId(NAV_DOTS, 'expanded', -1)).toBe('settings');
  });

  it('falls back to the edge item when current nav dot is missing', () => {
    expect(getAdjacentNavDotId(NAV_DOTS, 'aiChat', 1)).toBe('expanded');
    expect(getAdjacentNavDotId(NAV_DOTS, 'aiChat', -1)).toBe('settings');
  });

  it('returns null when no nav dots exist', () => {
    expect(getAdjacentNavDotId([], 'todo', 1)).toBeNull();
  });
});