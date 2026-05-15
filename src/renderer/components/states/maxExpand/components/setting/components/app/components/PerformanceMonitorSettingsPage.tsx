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

import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS,
  DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION,
  PERFORMANCE_MONITOR_CHART_COLORS_STORE_KEY,
  PERFORMANCE_MONITOR_HARDWARE_SELECTION_STORE_KEY,
  PERFORMANCE_MONITOR_METRIC_KEYS,
  type PerformanceMonitorChartColors,
  type PerformanceMonitorHardwareOption,
  type PerformanceMonitorHardwareOptions,
  type PerformanceMonitorHardwareSelection,
  type PerformanceMonitorMetricKey,
  isPerformanceMonitorColor,
  normalizePerformanceMonitorChartColors,
  normalizePerformanceMonitorHardwareSelection,
} from '../../../../../../../../utils/performanceMonitorColors';
import { SvgIcon } from '../../../../../../../../utils/SvgIcon/eisland-icon';

const COLOR_LABEL_KEYS: Record<PerformanceMonitorMetricKey, string> = {
  cpu: 'settings.app.performanceMonitor.colors.cpu',
  gpu: 'settings.app.performanceMonitor.colors.gpu',
  memory: 'settings.app.performanceMonitor.colors.memory',
  disk: 'settings.app.performanceMonitor.colors.disk',
};

const DEFAULT_HARDWARE_OPTIONS: PerformanceMonitorHardwareOptions = {
  cpu: [{ id: 'all', label: 'All CPU' }],
  gpu: [{ id: 'auto', label: 'Auto GPU' }],
  disk: [{ id: 'all', label: 'All Disks' }],
};

let cachedHardwareOptions: PerformanceMonitorHardwareOptions | null = null;
let cachedHardwareOptionsPromise: Promise<PerformanceMonitorHardwareOptions> | null = null;

function loadHardwareOptions(selection: PerformanceMonitorHardwareSelection): Promise<PerformanceMonitorHardwareOptions> {
  if (cachedHardwareOptions) return Promise.resolve(cachedHardwareOptions);
  if (cachedHardwareOptionsPromise) return cachedHardwareOptionsPromise;
  cachedHardwareOptionsPromise = window.api.getPerformanceSnapshot(selection)
    .then((snapshot) => {
      cachedHardwareOptions = snapshot.hardwareOptions;
      return snapshot.hardwareOptions;
    })
    .finally(() => {
      cachedHardwareOptionsPromise = null;
    });
  return cachedHardwareOptionsPromise;
}

function HardwareSelectDropdown({
  options,
  value,
  onChange,
  resolveLabel,
}: {
  options: PerformanceMonitorHardwareOption[];
  value: string;
  onChange: (value: string) => void;
  resolveLabel: (id: string, label: string) => string;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.id === value) ?? options[0];
  const selectedLabel = selectedOption ? resolveLabel(selectedOption.id, selectedOption.label) : value;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="settings-performance-monitor-hardware-dropdown" ref={wrapperRef}>
      <button
        className="settings-performance-monitor-hardware-dropdown-trigger"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="settings-performance-monitor-hardware-dropdown-label">{selectedLabel}</span>
        <span className="settings-performance-monitor-hardware-dropdown-arrow">▾</span>
      </button>
      {open && (
        <div className="settings-performance-monitor-hardware-dropdown-menu">
          <div
            className="settings-performance-monitor-hardware-dropdown-scroll"
            onWheelCapture={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.scrollTop += event.deltaY;
              event.currentTarget.scrollLeft += event.deltaX;
            }}
          >
            {options.map((option) => {
              const label = resolveLabel(option.id, option.label);
              return (
                <button
                  className={`settings-performance-monitor-hardware-dropdown-item ${option.id === value ? 'active' : ''}`}
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 渲染性能监控设置页面。
 */
export function PerformanceMonitorSettingsPage(): ReactElement {
  const { t } = useTranslation();
  const [colors, setColors] = useState<PerformanceMonitorChartColors>(DEFAULT_PERFORMANCE_MONITOR_CHART_COLORS);
  const [hardwareSelection, setHardwareSelection] = useState<PerformanceMonitorHardwareSelection>(DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION);
  const [hardwareOptions, setHardwareOptions] = useState<PerformanceMonitorHardwareOptions>(() => cachedHardwareOptions ?? DEFAULT_HARDWARE_OPTIONS);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(PERFORMANCE_MONITOR_CHART_COLORS_STORE_KEY).then((value) => {
      if (cancelled) return;
      setColors(normalizePerformanceMonitorChartColors(value));
    }).catch(() => {});
    const hydrateHardwareOptions = (value: unknown): void => {
      if (cancelled) return;
      const nextSelection = normalizePerformanceMonitorHardwareSelection(value);
      setHardwareSelection(nextSelection);
      loadHardwareOptions(nextSelection).then((nextOptions) => {
        if (cancelled) return;
        setHardwareOptions(nextOptions);
      }).catch(() => {});
    };
    window.api.storeRead(PERFORMANCE_MONITOR_HARDWARE_SELECTION_STORE_KEY)
      .then(hydrateHardwareOptions)
      .catch(() => hydrateHardwareOptions(DEFAULT_PERFORMANCE_MONITOR_HARDWARE_SELECTION));
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

  const updateHardwareSelection = (key: keyof PerformanceMonitorHardwareSelection, value: string): void => {
    const next = { ...hardwareSelection, [key]: value };
    setHardwareSelection(next);
    window.api.storeWrite(PERFORMANCE_MONITOR_HARDWARE_SELECTION_STORE_KEY, next).catch(() => {});
    window.api.settingsPreview(`store:${PERFORMANCE_MONITOR_HARDWARE_SELECTION_STORE_KEY}`, next).catch(() => {});
  };

  const getHardwareOptionLabel = (type: keyof PerformanceMonitorHardwareSelection, id: string, label: string): string => {
    if (type === 'cpu' && id === 'all') return t('settings.app.performanceMonitor.hardwareOptions.allCpu', { defaultValue: '全部 CPU' });
    if (type === 'gpu' && id === 'auto') return t('settings.app.performanceMonitor.hardwareOptions.autoGpu', { defaultValue: '自动选择 GPU' });
    if (type === 'disk' && id === 'all') return t('settings.app.performanceMonitor.hardwareOptions.allDisks', { defaultValue: '全部磁盘' });
    return label;
  };

  return (
    <div className="max-expand-settings-section settings-performance-monitor-page-panel">
      <div className="settings-cards">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.app.performanceMonitor.hardwareTitle', { defaultValue: '监控硬件' })}</div>
            <div className="settings-card-subtitle">{t('settings.app.performanceMonitor.hardwareHint', { defaultValue: '选择性能监控图表读取的 CPU、GPU 和磁盘目标。' })}</div>
          </div>
          <div className="settings-performance-monitor-hardware-grid">
            {(['cpu', 'gpu', 'disk'] as Array<keyof PerformanceMonitorHardwareSelection>).map((key) => (
              <label className="settings-field settings-performance-monitor-hardware-field" key={key}>
                <span className="settings-field-label">{t(`settings.app.performanceMonitor.hardware.${key}`, {
                  defaultValue: key === 'cpu' ? 'CPU' : key === 'gpu' ? 'GPU' : '磁盘',
                })}</span>
                <HardwareSelectDropdown
                  options={hardwareOptions[key]}
                  value={hardwareSelection[key]}
                  onChange={(value) => updateHardwareSelection(key, value)}
                  resolveLabel={(id, label) => getHardwareOptionLabel(key, id, label)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-performance-monitor-color-title-row">
              <div className="settings-card-title">{t('settings.app.performanceMonitor.colorsTitle', { defaultValue: '图表颜色' })}</div>
              <button
                className="settings-performance-monitor-reset-icon-btn"
                type="button"
                onClick={resetColors}
                title={t('settings.app.performanceMonitor.resetColors', { defaultValue: '恢复默认颜色' })}
                aria-label={t('settings.app.performanceMonitor.resetColors', { defaultValue: '恢复默认颜色' })}
              >
                <img src={SvgIcon.REVERT} alt="" className="settings-performance-monitor-reset-icon" />
              </button>
            </div>
            <div className="settings-card-subtitle">{t('settings.app.performanceMonitor.colorsHint', { defaultValue: '调整 Expand 性能监控中 CPU、GPU、内存和磁盘图表颜色。' })}</div>
          </div>
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
        </div>
      </div>
    </div>
  );
}
