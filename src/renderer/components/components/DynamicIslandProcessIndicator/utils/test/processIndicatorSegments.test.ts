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
 * @file processIndicatorSegments.test.ts
 * @description 分段进度条状态计算测试
 * @author 鸡哥
 */

import { describe, expect, it } from 'vitest';
import { createProcessSegments } from '../processIndicatorSegments';

describe('createProcessSegments', () => {
  it('should create stable segment states without previous progress', () => {
    expect(createProcessSegments(4, 1, null)).toEqual([
      { status: 'completed', motion: 'none' },
      { status: 'active', motion: 'none' },
      { status: 'inactive', motion: 'none' },
      { status: 'inactive', motion: 'none' },
    ]);
  });

  it('should mark only newly reached segments as enter motion', () => {
    expect(createProcessSegments(5, 3, { current: 1, total: 5 })).toEqual([
      { status: 'completed', motion: 'none' },
      { status: 'completed', motion: 'none' },
      { status: 'completed', motion: 'enter' },
      { status: 'active', motion: 'enter' },
      { status: 'inactive', motion: 'none' },
    ]);
  });

  it('should mark only removed segments as exit motion', () => {
    expect(createProcessSegments(5, 1, { current: 3, total: 5 })).toEqual([
      { status: 'completed', motion: 'none' },
      { status: 'active', motion: 'none' },
      { status: 'inactive', motion: 'exit' },
      { status: 'inactive', motion: 'exit' },
      { status: 'inactive', motion: 'none' },
    ]);
  });
});