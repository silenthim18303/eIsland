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

interface PerformanceSnapshot {
  timestamp: number;
  host: {
    hostname: string;
    platform: string;
    release: string;
    arch: string;
    uptimeSeconds: number;
  };
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    physicalCores: number;
    speedGhz: number | null;
    speedMaxGhz: number | null;
    loadPercent: number;
    temperatureCelsius: number | null;
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    availableBytes: number;
    usagePercent: number;
  };
  gpu: {
    vendor: string;
    model: string;
    vramTotalMb: number | null;
    loadPercent: number | null;
    temperatureCelsius: number | null;
  } | null;
  disk: {
    totalBytes: number;
    usedBytes: number;
    usagePercent: number;
    temperatureCelsius: number | null;
  };
  network: {
    iface: string;
    rxBytesPerSecond: number;
    txBytesPerSecond: number;
  };
}

interface MetricCardProps {
  label: string;
  value: number | null;
  valueText: string;
  detail: string;
  temperature: string;
  accent: string;
}

const REFRESH_INTERVAL_MS = 2000;

function clampPercent(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatPercent(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--';
  return `${Math.round(clampPercent(value))}%`;
}

function formatBytes(bytes: number | null | undefined): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) return '--';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

function formatRate(bytesPerSecond: number): string {
  const formatted = formatBytes(bytesPerSecond);
  return formatted === '--' ? '--' : `${formatted}/s`;
}

function formatTemp(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '--';
  return `${Math.round(value)}℃`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function MetricCard({ label, value, valueText, detail, temperature, accent }: MetricCardProps): React.ReactElement {
  const percent = clampPercent(value);
  return (
    <div className="pm-metric-card">
      <div
        className="pm-meter-ring"
        style={{ background: `conic-gradient(${accent} ${percent * 3.6}deg, rgba(var(--color-text-rgb), 0.1) 0deg)` }}
      >
        <div className="pm-meter-core">{valueText}</div>
      </div>
      <div className="pm-metric-body">
        <div className="pm-metric-head">
          <span className="pm-metric-label">{label}</span>
          <span className="pm-metric-temp">{temperature}</span>
        </div>
        <div className="pm-metric-detail">{detail}</div>
        <div className="pm-progress-track">
          <div className="pm-progress-fill" style={{ width: `${percent}%`, background: accent }} />
        </div>
      </div>
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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const loadSnapshot = (): void => {
      window.api.getPerformanceSnapshot()
        .then((data) => {
          if (cancelled) return;
          setSnapshot(data as PerformanceSnapshot);
          setFailed(false);
        })
        .catch(() => {
          if (cancelled) return;
          setFailed(true);
        });
    };
    loadSnapshot();
    timer = window.setInterval(loadSnapshot, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, []);

  const updatedTime = useMemo(() => {
    if (!snapshot) return '--';
    return new Date(snapshot.timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [snapshot]);

  if (!snapshot) {
    return (
      <div className="expand-tab-panel pm-tab-panel">
        <div className="pm-panel-wrap">
          <div className="pm-loading">
            {failed
              ? t('expanded.performanceMonitor.error', { defaultValue: '系统性能数据暂不可用' })
              : t('expanded.performanceMonitor.loading', { defaultValue: '正在读取系统性能数据...' })}
          </div>
        </div>
      </div>
    );
  }

  const gpuName = snapshot.gpu
    ? [snapshot.gpu.vendor, snapshot.gpu.model].filter(Boolean).join(' ') || t('expanded.performanceMonitor.status.unavailable', { defaultValue: '不可用' })
    : t('expanded.performanceMonitor.status.noGpu', { defaultValue: '未检测到显卡' });
  const cpuName = [snapshot.cpu.manufacturer, snapshot.cpu.brand].filter(Boolean).join(' ') || t('expanded.performanceMonitor.status.unavailable', { defaultValue: '不可用' });
  const osText = `${snapshot.host.platform} ${snapshot.host.release} · ${snapshot.host.arch}`;
  const speedText = snapshot.cpu.speedGhz && snapshot.cpu.speedMaxGhz
    ? `${snapshot.cpu.speedGhz.toFixed(2)} / ${snapshot.cpu.speedMaxGhz.toFixed(2)} GHz`
    : snapshot.cpu.speedGhz
      ? `${snapshot.cpu.speedGhz.toFixed(2)} GHz`
      : '--';
  const metrics: MetricCardProps[] = [
    {
      label: t('expanded.performanceMonitor.labels.cpu', { defaultValue: 'CPU' }),
      value: snapshot.cpu.loadPercent,
      valueText: formatPercent(snapshot.cpu.loadPercent),
      detail: `${snapshot.cpu.physicalCores}P / ${snapshot.cpu.cores}T · ${speedText}`,
      temperature: formatTemp(snapshot.cpu.temperatureCelsius),
      accent: '#5eead4',
    },
    {
      label: t('expanded.performanceMonitor.labels.gpu', { defaultValue: 'GPU' }),
      value: snapshot.gpu?.loadPercent ?? null,
      valueText: formatPercent(snapshot.gpu?.loadPercent ?? null),
      detail: snapshot.gpu?.vramTotalMb ? `${Math.round(snapshot.gpu.vramTotalMb)} MB VRAM` : gpuName,
      temperature: formatTemp(snapshot.gpu?.temperatureCelsius ?? null),
      accent: '#93c5fd',
    },
    {
      label: t('expanded.performanceMonitor.labels.memory', { defaultValue: '内存' }),
      value: snapshot.memory.usagePercent,
      valueText: formatPercent(snapshot.memory.usagePercent),
      detail: `${formatBytes(snapshot.memory.usedBytes)} / ${formatBytes(snapshot.memory.totalBytes)}`,
      temperature: t('expanded.performanceMonitor.labels.available', { defaultValue: '可用' }) + ` ${formatBytes(snapshot.memory.availableBytes)}`,
      accent: '#c084fc',
    },
    {
      label: t('expanded.performanceMonitor.labels.disk', { defaultValue: '磁盘' }),
      value: snapshot.disk.usagePercent,
      valueText: formatPercent(snapshot.disk.usagePercent),
      detail: `${formatBytes(snapshot.disk.usedBytes)} / ${formatBytes(snapshot.disk.totalBytes)}`,
      temperature: formatTemp(snapshot.disk.temperatureCelsius),
      accent: '#fbbf24',
    },
  ];
  const infoItems = [
    { label: t('expanded.performanceMonitor.labels.host', { defaultValue: '主机' }), value: snapshot.host.hostname },
    { label: t('expanded.performanceMonitor.labels.os', { defaultValue: '系统' }), value: osText },
    { label: t('expanded.performanceMonitor.labels.cpuModel', { defaultValue: '处理器' }), value: cpuName },
    { label: t('expanded.performanceMonitor.labels.gpuModel', { defaultValue: '显卡' }), value: gpuName },
    { label: t('expanded.performanceMonitor.labels.uptime', { defaultValue: '运行' }), value: formatUptime(snapshot.host.uptimeSeconds) },
    { label: t('expanded.performanceMonitor.labels.network', { defaultValue: '网络' }), value: snapshot.network.iface || '--' },
  ];

  return (
    <div className="expand-tab-panel pm-tab-panel">
      <div className="pm-panel-wrap">
        <div className="pm-dashboard-head">
          <div className="pm-title-group">
            <span className="pm-title">{t('expanded.performanceMonitor.title', { defaultValue: '系统性能' })}</span>
            <span className="pm-subtitle">{t('expanded.performanceMonitor.subtitle', { defaultValue: '实时硬件状态与温度' })}</span>
          </div>
          <div className="pm-network-pill">
            <span>↓ {formatRate(snapshot.network.rxBytesPerSecond)}</span>
            <span>↑ {formatRate(snapshot.network.txBytesPerSecond)}</span>
          </div>
          <span className="pm-updated">{t('expanded.performanceMonitor.updated', { defaultValue: '更新 {{time}}', time: updatedTime })}</span>
        </div>
        <div className="pm-dashboard-body">
          <div className="pm-metrics-grid">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
          <div className="pm-info-panel">
            {infoItems.map((item) => (
              <div className="pm-info-row" key={item.label}>
                <span className="pm-info-label">{item.label}</span>
                <span className="pm-info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
