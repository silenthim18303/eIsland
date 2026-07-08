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

import { useEffect } from 'react';
import type { SegmentStatus } from '../types';
import { PROGRESS_ANIMATION_MS } from '../config';

type RenderedProgress = { current: number; total: number };

let previousRenderedProgress: RenderedProgress | null = null;

/**
 * 分段进度条状态管理
 * @description 追踪进度变化，生成各分段状态，支持从左至右逐步填充动画
 */
export function useProcessIndicator(total: number, current: number): SegmentStatus[] {
  const previousProgress = previousRenderedProgress;
  const progressingRange = previousProgress !== null && previousProgress.total === total && current > previousProgress.current
    ? { from: previousProgress.current, to: current }
    : null;

  const progressingFrom = progressingRange?.from ?? null;
  const progressingTo = progressingRange?.to ?? null;

  useEffect(() => {
    if (progressingRange === null) {
      previousRenderedProgress = { current, total };
      return;
    }

    const timer = setTimeout(() => {
      previousRenderedProgress = { current, total };
    }, PROGRESS_ANIMATION_MS);

    return () => { clearTimeout(timer); };
  }, [current, progressingFrom, progressingTo, total]);

  return Array.from({ length: total }, (_, i) => {
    if (progressingRange !== null && i > progressingRange.from && i <= progressingRange.to) return 'progressing';
    if (i < current) return 'completed';
    if (i === current) return 'active';
    return 'inactive';
  });
}
