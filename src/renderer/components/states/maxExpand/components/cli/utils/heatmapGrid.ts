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
 * @file heatmapGrid.ts
 * @description 热力图月份网格构建：以今日为中心生成按月分块、按星期对齐的单元格数据。
 *              CLI 活动热力图与用户中心登录热力图共用同一套布局逻辑。
 * @author 鸡哥
 */

/** 一月到十二月的国际化短标签 key */
export const HEATMAP_MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;

/** 单个日期单元格 */
export interface HeatmapCell {
  key: string;
  label: string;
  count: number;
  future: boolean;
  isToday: boolean;
}

/** 单个月份块 */
export interface HeatmapMonth {
  key: string;
  month: number;
  offset: number;
  cells: HeatmapCell[];
}

/** 月份网格构建结果 */
export interface HeatmapGrid {
  months: HeatmapMonth[];
  max: number;
}

/** 构建参数 */
export interface BuildHeatmapMonthsOptions {
  /** 今日往前展示的月份数（含历史方向） */
  monthsBefore?: number;
  /** 今日往后展示的月份数（含未来方向） */
  monthsAfter?: number;
}

/** 生成 `年-月-日` 形式的键，月、日均不补零 */
export function heatmapDayKey(year: number, month1: number, day: number): string {
  return `${year}-${month1}-${day}`;
}

/**
 * 构建以今日为中心的月份网格。
 * @param getCount 根据日期键返回当天计数的函数（未来日期不会被调用）。
 * @param options 展示窗口配置。
 * @returns 月份块数组及窗口内最大计数。
 */
export function buildHeatmapMonths(
  getCount: (key: string) => number,
  options: BuildHeatmapMonthsOptions = {},
): HeatmapGrid {
  const monthsBefore = options.monthsBefore ?? 6;
  const monthsAfter = options.monthsAfter ?? 5;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayKey = heatmapDayKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const months: HeatmapMonth[] = [];
  let max = 1;
  for (let m = monthsBefore; m >= -monthsAfter; m -= 1) {
    const ref = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // 周一为 0
    const cells: HeatmapCell[] = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(year, month, day);
      const future = d.getTime() > now.getTime();
      const key = heatmapDayKey(year, month + 1, day);
      const count = future ? 0 : getCount(key);
      if (!future && count > max) max = count;
      cells.push({ key, label: `${month + 1}/${day}`, count, future, isToday: key === todayKey });
    }
    months.push({ key: `${year}-${month}`, month, offset: firstDow, cells });
  }
  return { months, max };
}
