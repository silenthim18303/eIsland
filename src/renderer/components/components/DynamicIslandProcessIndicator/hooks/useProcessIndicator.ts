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

import { useEffect, useRef, useState } from 'react';

/** 进度动画时长（ms） */
const PROGRESS_ANIMATION_MS = 620;

/** 单个分段状态 */
export type SegmentStatus = 'completed' | 'active' | 'progressing' | 'inactive';

/**
 * 分段进度条状态管理
 * @description 追踪进度变化，生成各分段状态，支持从左至右逐步填充动画
 */
export function useProcessIndicator(total: number, current: number): SegmentStatus[] {
  const previousRef = useRef<{ current: number; total: number } | null>(null);
  const [progressStart, setProgressStart] = useState<number | null>(null);
  const [isProgressing, setIsProgressing] = useState(false);

  const prev = previousRef.current;
  const isProgressIncreasing = prev !== null && prev.total === total && current > prev.current;

  useEffect(() => {
    if (!isProgressIncreasing) {
      previousRef.current = { current, total };
      return;
    }

    setProgressStart(prev!.current);
    setIsProgressing(true);

    const timer = setTimeout(() => {
      setIsProgressing(false);
      setProgressStart(null);
      previousRef.current = { current, total };
    }, PROGRESS_ANIMATION_MS);

    return () => { clearTimeout(timer); };
  }, [current, isProgressIncreasing, total]);

  // 首次渲染直接记录
  if (prev === null) {
    previousRef.current = { current, total };
  }

  return Array.from({ length: total }, (_, i) => {
    if (i < current) return 'completed';
    if (i === current) return 'active';
    if (isProgressing && progressStart !== null && i > progressStart && i <= current) return 'progressing';
    return 'inactive';
  });
}
