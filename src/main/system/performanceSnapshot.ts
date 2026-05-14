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
 * @file performanceSnapshot.ts
 * @description 基于 systeminformation 采集系统性能快照。
 * @author 鸡哥
 */

import * as si from 'systeminformation';

export interface SystemPerformanceSnapshot {
  timestamp: number;
  cpuUsagePercent: number;
  gpuUsagePercent: number;
  memoryUsagePercent: number;
  memoryUsedBytes: number;
  memoryTotalBytes: number;
  diskUsagePercent: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  netRxBytesPerSec: number;
  netTxBytesPerSec: number;
  uptimeSeconds: number;
  cpuModel: string;
  cpuCores: number;
  cpuThreads: number;
  cpuSpeedGHz: number;
  gpuModel: string;
  gpuVramMB: number;
  osName: string;
}

let previousNetworkSample: { timestamp: number; rxBytes: number; txBytes: number } | null = null;

let cachedHardwareInfo: {
  cpuModel: string;
  cpuCores: number;
  cpuThreads: number;
  cpuSpeedGHz: number;
  gpuModel: string;
  gpuVramMB: number;
  osName: string;
} | null = null;

async function getHardwareInfo(): Promise<typeof cachedHardwareInfo & object> {
  if (cachedHardwareInfo) return cachedHardwareInfo;
  const [cpu, graphics, osInfo] = await Promise.all([
    si.cpu(),
    si.graphics(),
    si.osInfo(),
  ]);
  cachedHardwareInfo = {
    cpuModel: cpu.brand || cpu.manufacturer || 'Unknown',
    cpuCores: toSafeNumber(cpu.physicalCores) || toSafeNumber(cpu.cores),
    cpuThreads: toSafeNumber(cpu.cores),
    cpuSpeedGHz: toSafeNumber(cpu.speed),
    gpuModel: graphics.controllers.length > 0 ? (graphics.controllers[0].model || 'Unknown') : 'N/A',
    gpuVramMB: graphics.controllers.length > 0 ? toSafeNumber(graphics.controllers[0].vram) : 0,
    osName: `${osInfo.distro} ${osInfo.release}`.trim() || 'Unknown',
  };
  return cachedHardwareInfo;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function toSafeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function summarizeDiskUsage(fsList: si.Systeminformation.FsSizeData[]): {
  totalBytes: number;
  usedBytes: number;
  usagePercent: number;
} {
  const summary = fsList.reduce((acc, item) => {
    const size = toSafeNumber(item.size);
    const used = toSafeNumber(item.used);
    if (size <= 0) return acc;
    return {
      totalBytes: acc.totalBytes + size,
      usedBytes: acc.usedBytes + Math.max(0, Math.min(used, size)),
    };
  }, { totalBytes: 0, usedBytes: 0 });

  const usagePercent = summary.totalBytes > 0
    ? clampPercent((summary.usedBytes / summary.totalBytes) * 100)
    : 0;

  return {
    totalBytes: summary.totalBytes,
    usedBytes: summary.usedBytes,
    usagePercent,
  };
}

function summarizeNetworkRate(networkStats: si.Systeminformation.NetworkStatsData[]): {
  rxBytesPerSec: number;
  txBytesPerSec: number;
} {
  const rxBytes = networkStats.reduce((sum, item) => sum + toSafeNumber(item.rx_bytes), 0);
  const txBytes = networkStats.reduce((sum, item) => sum + toSafeNumber(item.tx_bytes), 0);
  const timestamp = Date.now();

  if (!previousNetworkSample) {
    previousNetworkSample = { timestamp, rxBytes, txBytes };
    return { rxBytesPerSec: 0, txBytesPerSec: 0 };
  }

  const deltaSeconds = (timestamp - previousNetworkSample.timestamp) / 1000;
  if (deltaSeconds <= 0) {
    previousNetworkSample = { timestamp, rxBytes, txBytes };
    return { rxBytesPerSec: 0, txBytesPerSec: 0 };
  }

  const rxBytesPerSec = Math.max(0, (rxBytes - previousNetworkSample.rxBytes) / deltaSeconds);
  const txBytesPerSec = Math.max(0, (txBytes - previousNetworkSample.txBytes) / deltaSeconds);

  previousNetworkSample = { timestamp, rxBytes, txBytes };
  return { rxBytesPerSec, txBytesPerSec };
}

/**
 * 获取系统性能快照
 * @description 返回 CPU/内存/磁盘/网络/运行时长的当前值
 */
export async function querySystemPerformanceSnapshot(): Promise<SystemPerformanceSnapshot> {
  const [cpuLoad, graphics, memory, fsList, networkStats, time, hw] = await Promise.all([
    si.currentLoad(),
    si.graphics(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
    si.time(),
    getHardwareInfo(),
  ]);

  const gpuUsagePercent = graphics.controllers.length > 0
    ? clampPercent(toSafeNumber(graphics.controllers[0].utilizationGpu))
    : 0;

  const memoryTotalBytes = toSafeNumber(memory.total);
  const memoryUsedBytes = toSafeNumber(memory.used);
  const memoryUsagePercent = memoryTotalBytes > 0
    ? clampPercent((memoryUsedBytes / memoryTotalBytes) * 100)
    : 0;

  const disk = summarizeDiskUsage(fsList);
  const network = summarizeNetworkRate(networkStats);

  return {
    timestamp: Date.now(),
    cpuUsagePercent: clampPercent(toSafeNumber(cpuLoad.currentLoad)),
    gpuUsagePercent,
    memoryUsagePercent,
    memoryUsedBytes,
    memoryTotalBytes,
    diskUsagePercent: disk.usagePercent,
    diskUsedBytes: disk.usedBytes,
    diskTotalBytes: disk.totalBytes,
    netRxBytesPerSec: network.rxBytesPerSec,
    netTxBytesPerSec: network.txBytesPerSec,
    uptimeSeconds: Math.max(0, Math.floor(toSafeNumber(time.uptime))),
    cpuModel: hw.cpuModel,
    cpuCores: hw.cpuCores,
    cpuThreads: hw.cpuThreads,
    cpuSpeedGHz: hw.cpuSpeedGHz,
    gpuModel: hw.gpuModel,
    gpuVramMB: hw.gpuVramMB,
    osName: hw.osName,
  };
}
