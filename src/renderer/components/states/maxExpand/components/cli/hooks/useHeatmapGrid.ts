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
 * @file useHeatmapGrid.ts
 * @description 热力图网格数据计算 Hook
 * @author 鸡哥
 */

import { useMemo } from 'react';
import type { CliHeatmapDaily, HeatmapMetric, HeatmapGridResult } from '../types/types';
import { buildHeatmapMonths } from '../utils/heatmapGrid';

/**
 * 根据热力图数据和当前指标计算网格
 * @param heatmap - 按天累计的指标数据
 * @param metric - 当前选中的指标
 * @returns 网格数据、色阶映射函数
 */
export function useHeatmapGrid(heatmap: CliHeatmapDaily, metric: HeatmapMetric): HeatmapGridResult {
  return useMemo(() => {
    const totals = { session: 0, tool: 0, prompt: 0 };
    const dayCounts = new Map<string, number>();
    Object.entries(heatmap).forEach(([key, counts]) => {
      totals.session += counts.session;
      totals.tool += counts.tool;
      totals.prompt += counts.prompt;
      const value = counts[metric];
      if (value > 0) dayCounts.set(key, value);
    });
    const { months, max } = buildHeatmapMonths((key) => dayCounts.get(key) ?? 0);

    const levelOf = (count: number): number => {
      if (count <= 0) return 0;
      return Math.min(4, Math.ceil((count / max) * 4));
    };

    return { months, max, totals, levelOf };
  }, [heatmap, metric]);
}
