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
 * @file useHeatmapScroll.ts
 * @description 热力图滚动到今日 Hook
 * @author 鸡哥
 */

import { useEffect, useRef } from 'react';
import type { HeatmapScrollRefs } from '../types/types';

/**
 * 管理热力图滚动位置，可见性或指标切换时把今日格子滚动到水平居中
 * @param visible - 面板是否可见
 * @param metric - 当前指标（切换时重新滚动）
 * @returns 容器和今日格子的 ref
 */
export function useHeatmapScroll(visible: boolean, metric: string): HeatmapScrollRefs {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => {
      const scroller = scrollRef.current;
      const today = todayRef.current;
      if (!scroller || !today) return;
      scroller.scrollLeft = today.offsetLeft - scroller.clientWidth / 2 + today.offsetWidth / 2;
    });
    return () => cancelAnimationFrame(id);
  }, [visible, metric]);

  return { scrollRef, todayRef };
}
