import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS,
  DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION,
  isPerformanceMonitorColor,
  normalizePerformanceMonitorChartColors,
  normalizePerformanceMonitorHardwareSelection,
} from './performanceMonitorColors';

describe('performanceMonitorColors', () => {
  it('validates color format', () => {
    expect(isPerformanceMonitorColor('#AABBCC')).toBe(true);
    expect(isPerformanceMonitorColor('#abc')).toBe(false);
    expect(isPerformanceMonitorColor('AABBCC')).toBe(false);
  });

  it('normalizes chart colors with defaults', () => {
    expect(normalizePerformanceMonitorChartColors(null)).toEqual(DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS);
    expect(normalizePerformanceMonitorChartColors({ cpu: '#112233', memory: '#445566' })).toEqual({
      cpu: '#112233',
      gpu: DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS.gpu,
      memory: '#445566',
      disk: DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS.disk,
    });
  });

  it('normalizes hardware selection with defaults', () => {
    expect(normalizePerformanceMonitorHardwareSelection(null)).toEqual(DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION);
    expect(normalizePerformanceMonitorHardwareSelection({ cpu: '0', gpu: '', disk: 'disk-1' })).toEqual({
      cpu: '0',
      gpu: DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION.gpu,
      disk: 'disk-1',
    });
  });
});
