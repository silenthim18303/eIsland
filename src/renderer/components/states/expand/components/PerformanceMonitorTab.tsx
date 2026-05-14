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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type PerformanceSnapshot = NonNullable<Awaited<ReturnType<typeof window.api.getSystemPerformanceSnapshot>>>;

interface PerformanceHistoryPoint {
  cpu: number;
  memory: number;
  disk: number;
  rx: number;
  tx: number;
}

const POLL_INTERVAL_MS = 1000;
const HISTORY_LIMIT = 36;
const CHART_WIDTH = 300;
const CHART_HEIGHT = 72;

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatPercent(value: number): string {
  return `${clampPercent(value).toFixed(1)}%`;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const divisor = 1024 ** index;
  const value = bytes / divisor;
  const precision = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(precision)} ${units[index]}`;
}

function formatRate(bytesPerSec: number): string {
  return `${formatBytes(bytesPerSec)}/s`;
}

function formatUptime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function buildPercentLinePoints(values: number[]): string {
  if (!values.length) return '';
  if (values.length === 1) {
    const y = CHART_HEIGHT - (clampPercent(values[0]) / 100) * CHART_HEIGHT;
    return `0,${y.toFixed(1)}`;
  }
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - (clampPercent(value) / 100) * CHART_HEIGHT;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function buildRateLinePoints(values: number[]): string {
  if (!values.length) return '';
  const peak = Math.max(...values, 1);
  if (values.length === 1) {
    const y = CHART_HEIGHT - (values[0] / peak) * CHART_HEIGHT;
    return `0,${y.toFixed(1)}`;
  }
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - (value / peak) * CHART_HEIGHT;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

/**
 * 性能监控 Tab
 * @description 展开状态下展示 CPU/内存/磁盘/网络的实时指标
 */
export function PerformanceMonitorTab(): React.ReactElement {
  const { t } = useTranslation();
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);
  const [history, setHistory] = useState<PerformanceHistoryPoint[]>([]);

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const pull = (): void => {
      window.api.getSystemPerformanceSnapshot().then((next) => {
        if (disposed || !next) return;
        setSnapshot(next);
        setHistory((prev) => {
          const point: PerformanceHistoryPoint = {
            cpu: next.cpuUsagePercent,
            memory: next.memoryUsagePercent,
            disk: next.diskUsagePercent,
            rx: next.netRxBytesPerSec,
            tx: next.netTxBytesPerSec,
          };
          return [...prev, point].slice(-HISTORY_LIMIT);
        });
      }).catch(() => {});
    };

    pull();
    timer = setInterval(pull, POLL_INTERVAL_MS);

    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
    };
  }, []);

  const percentLines = useMemo(() => {
    return {
      cpu: buildPercentLinePoints(history.map((item) => item.cpu)),
      memory: buildPercentLinePoints(history.map((item) => item.memory)),
      disk: buildPercentLinePoints(history.map((item) => item.disk)),
    };
  }, [history]);

  const rateLines = useMemo(() => {
    return {
      rx: buildRateLinePoints(history.map((item) => item.rx)),
      tx: buildRateLinePoints(history.map((item) => item.tx)),
    };
  }, [history]);

  return (
    <div className="expand-tab-panel pm-tab-panel">
      <div className="pm-panel-wrap">
        <div className="pm-panel-header">
          <div className="pm-panel-title">{t('expanded.performanceMonitor.title')}</div>
          <div className="pm-panel-subtitle">{t('expanded.performanceMonitor.subtitle')}</div>
        </div>

        {!snapshot && (
          <div className="pm-loading">{t('expanded.performanceMonitor.loading')}</div>
        )}

        {snapshot && (
          <>
            <div className="pm-card-grid">
              <div className="pm-metric-card">
                <div className="pm-metric-label">{t('expanded.performanceMonitor.cards.cpu')}</div>
                <div className="pm-metric-value">{formatPercent(snapshot.cpuUsagePercent)}</div>
              </div>
              <div className="pm-metric-card">
                <div className="pm-metric-label">{t('expanded.performanceMonitor.cards.memory')}</div>
                <div className="pm-metric-value">{formatPercent(snapshot.memoryUsagePercent)}</div>
                <div className="pm-metric-extra">{`${formatBytes(snapshot.memoryUsedBytes)} / ${formatBytes(snapshot.memoryTotalBytes)}`}</div>
              </div>
              <div className="pm-metric-card">
                <div className="pm-metric-label">{t('expanded.performanceMonitor.cards.disk')}</div>
                <div className="pm-metric-value">{formatPercent(snapshot.diskUsagePercent)}</div>
                <div className="pm-metric-extra">{`${formatBytes(snapshot.diskUsedBytes)} / ${formatBytes(snapshot.diskTotalBytes)}`}</div>
              </div>
              <div className="pm-metric-card">
                <div className="pm-metric-label">{t('expanded.performanceMonitor.cards.download')}</div>
                <div className="pm-metric-value">{formatRate(snapshot.netRxBytesPerSec)}</div>
              </div>
              <div className="pm-metric-card">
                <div className="pm-metric-label">{t('expanded.performanceMonitor.cards.upload')}</div>
                <div className="pm-metric-value">{formatRate(snapshot.netTxBytesPerSec)}</div>
              </div>
              <div className="pm-metric-card">
                <div className="pm-metric-label">{t('expanded.performanceMonitor.cards.uptime')}</div>
                <div className="pm-metric-value">{formatUptime(snapshot.uptimeSeconds)}</div>
              </div>
            </div>

            <div className="pm-chart-grid">
              <div className="pm-chart-card">
                <div className="pm-chart-title">{t('expanded.performanceMonitor.charts.resources')}</div>
                <svg className="pm-line-chart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none" role="img" aria-label={t('expanded.performanceMonitor.charts.resources')}>
                  <polyline className="pm-line pm-line-cpu" points={percentLines.cpu} fill="none" />
                  <polyline className="pm-line pm-line-memory" points={percentLines.memory} fill="none" />
                  <polyline className="pm-line pm-line-disk" points={percentLines.disk} fill="none" />
                </svg>
                <div className="pm-legend">
                  <span className="pm-legend-item"><i className="pm-legend-dot pm-line-cpu" />{t('expanded.performanceMonitor.legend.cpu')}</span>
                  <span className="pm-legend-item"><i className="pm-legend-dot pm-line-memory" />{t('expanded.performanceMonitor.legend.memory')}</span>
                  <span className="pm-legend-item"><i className="pm-legend-dot pm-line-disk" />{t('expanded.performanceMonitor.legend.disk')}</span>
                </div>
              </div>

              <div className="pm-chart-card">
                <div className="pm-chart-title">{t('expanded.performanceMonitor.charts.network')}</div>
                <svg className="pm-line-chart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none" role="img" aria-label={t('expanded.performanceMonitor.charts.network')}>
                  <polyline className="pm-line pm-line-rx" points={rateLines.rx} fill="none" />
                  <polyline className="pm-line pm-line-tx" points={rateLines.tx} fill="none" />
                </svg>
                <div className="pm-legend">
                  <span className="pm-legend-item"><i className="pm-legend-dot pm-line-rx" />{t('expanded.performanceMonitor.legend.download')}</span>
                  <span className="pm-legend-item"><i className="pm-legend-dot pm-line-tx" />{t('expanded.performanceMonitor.legend.upload')}</span>
                </div>
              </div>
            </div>

            <div className="pm-updated-at">
              {t('expanded.performanceMonitor.updatedAt', { time: new Date(snapshot.timestamp).toLocaleTimeString() })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
