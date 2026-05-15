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
 * @file PerformanceMonitorSettingsPage.tsx
 * @description 设置页面 - 性能监控设置页
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS,
  PERFORMANCE_MONITOR_CHART_COLORS_STORE_KEY,
  PERFORMANCE_MONITOR_METRIC_KEYS,
  type PerformanceMonitorChartColors,
  type PerformanceMonitorMetricKey,
  isPerformanceMonitorColor,
  normalizePerformanceMonitorChartColors,
} from '../../../../../../../../utils/performanceMonitorColors';

const COLOR_LABEL_KEYS: Record<PerformanceMonitorMetricKey, string> = {
  cpu: 'settings.app.performanceMonitor.colors.cpu',
  gpu: 'settings.app.performanceMonitor.colors.gpu',
  memory: 'settings.app.performanceMonitor.colors.memory',
  disk: 'settings.app.performanceMonitor.colors.disk',
};

export function PerformanceMonitorSettingsPage(): ReactElement {
  const { t } = useTranslation();
  const [colors, setColors] = useState<PerformanceMonitorChartColors>(DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(PERFORMANCE_MONITOR_CHART_COLORS_STORE_KEY).then((value) => {
      if (cancelled) return;
      setColors(normalizePerformanceMonitorChartColors(value));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const updateColor = (key: PerformanceMonitorMetricKey, value: string): void => {
    if (!isPerformanceMonitorColor(value)) return;
    const next = { ...colors, [key]: value };
    setColors(next);
    window.api.storeWrite(PERFORMANCE_MONITOR_CHART_COLORS_STORE_KEY, next).catch(() => {});
    window.api.settingsPreview(`store:${PERFORMANCE_MONITOR_CHART_COLORS_STORE_KEY}`, next).catch(() => {});
  };

  const resetColors = (): void => {
    const next = { ...DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS };
    setColors(next);
    window.api.storeWrite(PERFORMANCE_MONITOR_CHART_COLORS_STORE_KEY, next).catch(() => {});
    window.api.settingsPreview(`store:${PERFORMANCE_MONITOR_CHART_COLORS_STORE_KEY}`, next).catch(() => {});
  };

  return (
    <div className="max-expand-settings-section settings-performance-monitor-page-panel">
      <div className="settings-cards">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.app.performanceMonitor.colorsTitle', { defaultValue: '图表颜色' })}</div>
            <div className="settings-card-subtitle">{t('settings.app.performanceMonitor.colorsHint', { defaultValue: '调整 Expand 性能监控中 CPU、GPU、内存和磁盘图表颜色。' })}</div>
          </div>
          <div className="settings-performance-monitor-color-row">
            <div className="settings-performance-monitor-color-grid">
              {PERFORMANCE_MONITOR_METRIC_KEYS.map((key) => (
                <label className="settings-performance-monitor-color-field" key={key}>
                  <span className="settings-field-label">{t(COLOR_LABEL_KEYS[key], { defaultValue: key.toUpperCase() })}</span>
                  <span className="settings-performance-monitor-color-control">
                    <input
                      className="settings-performance-monitor-color-input"
                      type="color"
                      value={colors[key]}
                      onChange={(event) => updateColor(key, event.target.value)}
                    />
                    <span className="settings-performance-monitor-color-value">{colors[key]}</span>
                  </span>
                </label>
              ))}
            </div>
            <button className="settings-hotkey-btn" type="button" onClick={resetColors}>
              {t('settings.app.performanceMonitor.resetColors', { defaultValue: '恢复默认颜色' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
