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
 * @file PerformanceMonitorTab.tsx
 * @description Expanded 性能监控 Tab
 * @author 鸡哥
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type PerformanceSnapshot = NonNullable<Awaited<ReturnType<typeof window.api.getSystemPerformanceSnapshot>>>;

const POLL_INTERVAL_MS = 1000;
const POLL_START_DELAY_MS = 280;
const GAUGE_R = 42;
const GAUGE_CX = 50;
const GAUGE_CY = 50;
const GAUGE_STROKE = 8;
const GAUGE_CIRC = Math.PI * GAUGE_R;
const GAUGE_COLOR = '#66d1ff';

function clamp(v: number, min = 0, max = 100): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function fmtPct(v: number): string { return `${clamp(v).toFixed(1)}%`; }

function GaugeChart({ percent, label }: { percent: number; label: string }): React.ReactElement {
  const p = clamp(percent);
  const dash = (p / 100) * GAUGE_CIRC;
  return (
    <div className="pm-gauge-cell">
      <svg viewBox="0 0 100 60" className="pm-gauge-svg">
        <path
          d={`M ${GAUGE_CX - GAUGE_R} ${GAUGE_CY} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R} ${GAUGE_CY}`}
          fill="none" stroke="rgba(var(--color-text-rgb),0.1)" strokeWidth={GAUGE_STROKE} strokeLinecap="round"
        />
        <path
          d={`M ${GAUGE_CX - GAUGE_R} ${GAUGE_CY} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R} ${GAUGE_CY}`}
          fill="none" stroke={GAUGE_COLOR} strokeWidth={GAUGE_STROKE} strokeLinecap="round"
          strokeDasharray={`${dash.toFixed(2)} ${GAUGE_CIRC.toFixed(2)}`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
        <text x={GAUGE_CX} y={GAUGE_CY - 8} textAnchor="middle" className="pm-gauge-pct">{fmtPct(p)}</text>
      </svg>
      <span className="pm-gauge-label">{label}</span>
    </div>
  );
}

/**
 * 性能监控 Tab
 * @description 展开状态下展示 CPU/GPU/内存/磁盘 4 个仪表盘
 */
export function PerformanceMonitorTab(): React.ReactElement {
  const { t } = useTranslation();
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    let startTimer: ReturnType<typeof setTimeout> | null = null;

    const pull = (): void => {
      window.api.getSystemPerformanceSnapshot().then((next) => {
        if (disposed || !next) return;
        setSnapshot(next);
      }).catch(() => {});
    };

    startTimer = setTimeout(() => {
      requestAnimationFrame(() => {
        if (disposed) return;
        pull();
        timer = setInterval(pull, POLL_INTERVAL_MS);
      });
    }, POLL_START_DELAY_MS);

    return () => {
      disposed = true;
      if (startTimer) clearTimeout(startTimer);
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div className="expand-tab-panel pm-tab-panel">
      <div className="pm-panel-wrap">
        {!snapshot && (
          <div className="pm-loading">{t('expanded.performanceMonitor.loading')}</div>
        )}

        {snapshot && (
          <div className="pm-gauge-grid">
            <GaugeChart percent={snapshot.cpuUsagePercent} label="CPU" />
            <GaugeChart percent={snapshot.memoryUsagePercent} label={t('expanded.performanceMonitor.legend.memory')} />
            <GaugeChart percent={snapshot.gpuUsagePercent} label="GPU" />
            <GaugeChart percent={snapshot.diskUsagePercent} label={t('expanded.performanceMonitor.legend.disk')} />
          </div>
        )}
      </div>
    </div>
  );
}
