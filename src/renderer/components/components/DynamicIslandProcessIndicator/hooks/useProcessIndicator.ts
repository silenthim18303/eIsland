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
 * @file useProcessIndicator.ts
 * @description 分段进度条状态管理 hook
 * @author 鸡哥
 */

import { useLayoutEffect, useRef } from 'react';
import type { ProcessSegment, RenderedProgress } from '../types';
import { createProcessSegments } from '../utils/processIndicatorSegments';

let lastSettledProgress: RenderedProgress | null = null;

/**
 * 分段进度条状态管理
 * @description 追踪进度变化，生成各分段状态，支持前进/后退动画
 */
export function useProcessIndicator(total: number, current: number): ProcessSegment[] {
  const previousRef = useRef<RenderedProgress | null>(lastSettledProgress);
  const previousProgress = previousRef.current?.total === total ? previousRef.current : null;
  const segments = createProcessSegments(total, current, previousProgress);

  useLayoutEffect(() => {
    const nextProgress = { current, total };
    previousRef.current = nextProgress;
    lastSettledProgress = nextProgress;
  }, [current, total]);

  return segments;
}
