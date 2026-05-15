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
 * @file performanceMonitorColors.ts
 * @description 性能监控颜色与硬件选择的常量定义及标准化工具。
 * @author 鸡哥
 */

export type PerformanceMonitorMetricKey = 'cpu' | 'gpu' | 'memory' | 'disk';

export interface PerformanceMonitorChartColors {
  cpu: string;
  gpu: string;
  memory: string;
  disk: string;
}

export interface PerformanceMonitorHardwareSelection {
  cpu: string;
  gpu: string;
  disk: string;
}

export interface PerformanceMonitorHardwareOption {
  id: string;
  label: string;
}

export interface PerformanceMonitorHardwareOptions {
  cpu: PerformanceMonitorHardwareOption[];
  gpu: PerformanceMonitorHardwareOption[];
  disk: PerformanceMonitorHardwareOption[];
}

export const PERFORMANCE_MONITOR_CHART_COLORS_STORE_KEY = 'performance-monitor-chart-colors';
export const PERFORMANCE_MONITOR_HARDWARE_SELECTION_STORE_KEY = 'performance-monitor-hardware-selection';

export const DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS: PerformanceMonitorChartColors = {
  cpu: '#5eead4',
  gpu: '#93c5fd',
  memory: '#c084fc',
  disk: '#fbbf24',
};

export const DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION: PerformanceMonitorHardwareSelection = {
  cpu: 'all',
  gpu: 'auto',
  disk: 'all',
};

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
export const PERFORMANCE_MONITOR_METRIC_KEYS: PerformanceMonitorMetricKey[] = ['cpu', 'gpu', 'memory', 'disk'];

/**
 * 判断输入值是否为合法的性能监控十六进制颜色。
 */
export function isPerformanceMonitorColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_RE.test(value);
}

/**
 * 将任意输入标准化为完整的性能监控图表颜色配置。
 */
export function normalizePerformanceMonitorChartColors(value: unknown): PerformanceMonitorChartColors {
  if (!value || typeof value !== 'object') return { ...DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS };
  const source = value as Partial<Record<PerformanceMonitorMetricKey, unknown>>;
  return PERFORMANCE_MONITOR_METRIC_KEYS.reduce<PerformanceMonitorChartColors>((acc, key) => ({
    ...acc,
    [key]: isPerformanceMonitorColor(source[key]) ? source[key] : DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS[key],
  }), { ...DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS });
}

/**
 * 将任意输入标准化为完整的性能监控硬件选择配置。
 */
export function normalizePerformanceMonitorHardwareSelection(value: unknown): PerformanceMonitorHardwareSelection {
  if (!value || typeof value !== 'object') return { ...DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION };
  const source = value as Partial<Record<keyof PerformanceMonitorHardwareSelection, unknown>>;
  return {
    cpu: typeof source.cpu === 'string' && source.cpu ? source.cpu : DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION.cpu,
    gpu: typeof source.gpu === 'string' && source.gpu ? source.gpu : DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION.gpu,
    disk: typeof source.disk === 'string' && source.disk ? source.disk : DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION.disk,
  };
}
