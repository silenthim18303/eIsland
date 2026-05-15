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

export function normalizePerformanceMonitorHardwareSelection(value: unknown): PerformanceMonitorHardwareSelection {
  if (!value || typeof value !== 'object') return { ...DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION };
  const source = value as Partial<Record<keyof PerformanceMonitorHardwareSelection, unknown>>;
  return {
    cpu: typeof source.cpu === 'string' && source.cpu ? source.cpu : DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION.cpu,
    gpu: typeof source.gpu === 'string' && source.gpu ? source.gpu : DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION.gpu,
    disk: typeof source.disk === 'string' && source.disk ? source.disk : DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION.disk,
  };
}
