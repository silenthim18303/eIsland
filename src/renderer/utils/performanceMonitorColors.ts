export type PerformanceMonitorMetricKey = 'cpu' | 'gpu' | 'memory' | 'disk';

export interface PerformanceMonitorChartColors {
  cpu: string;
  gpu: string;
  memory: string;
  disk: string;
}

export const PERFORMANCE_MONITOR_CHART_COLORS_STORE_KEY = 'performance-monitor-chart-colors';

export const DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS: PerformanceMonitorChartColors = {
  cpu: '#5eead4',
  gpu: '#93c5fd',
  memory: '#c084fc',
  disk: '#fbbf24',
};

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
export const PERFORMANCE_MONITOR_METRIC_KEYS: PerformanceMonitorMetricKey[] = ['cpu', 'gpu', 'memory', 'disk'];

export function isPerformanceMonitorColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_RE.test(value);
}

export function normalizePerformanceMonitorChartColors(value: unknown): PerformanceMonitorChartColors {
  if (!value || typeof value !== 'object') return { ...DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS };
  const source = value as Partial<Record<PerformanceMonitorMetricKey, unknown>>;
  return PERFORMANCE_MONITOR_METRIC_KEYS.reduce<PerformanceMonitorChartColors>((acc, key) => ({
    ...acc,
    [key]: isPerformanceMonitorColor(source[key]) ? source[key] : DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS[key],
  }), { ...DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS });
}
