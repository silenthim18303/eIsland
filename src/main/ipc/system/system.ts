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
 * @file system.ts
 * @description 系统相关 IPC 处理模块
 * @description 处理任务管理器打开和运行进程查询的 IPC 请求
 * @author 鸡哥
 */

import { ipcMain } from 'electron';
import { exec } from 'child_process';
import os from 'os';
import * as si from 'systeminformation';

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

interface RunningProcessInfo {
  name: string;
  iconDataUrl: string | null;
}

interface RunningWindowInfo {
  id: string;
  title: string;
  processName: string;
  processPath: string | null;
  processId: number | null;
  iconDataUrl: string | null;
}

interface RegisterSystemIpcHandlersOptions {
  queryRunningNonSystemProcessNames: () => Promise<string[]>;
  queryRunningNonSystemProcessesWithIcons: () => Promise<RunningProcessInfo[]>;
  queryOpenWindowsWithIcons: () => Promise<RunningWindowInfo[]>;
  queryFocusedWindow: () => Promise<RunningWindowInfo | null>;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function positiveNumber(value: unknown): number | null {
  const numeric = finiteNumber(value);
  return numeric !== null && numeric > 0 ? numeric : null;
}

function clampPercent(value: unknown): number {
  const numeric = finiteNumber(value);
  if (numeric === null) return 0;
  return Math.max(0, Math.min(100, numeric));
}

async function collectPerformanceSnapshot(): Promise<PerformanceSnapshot> {
  const [
    cpu,
    load,
    cpuTemperature,
    memory,
    graphics,
    fsSizes,
    diskLayouts,
    networkStats,
  ] = await Promise.all([
    si.cpu().catch(() => null),
    si.currentLoad().catch(() => null),
    si.cpuTemperature().catch(() => null),
    si.mem().catch(() => null),
    si.graphics().catch(() => null),
    si.fsSize().catch(() => []),
    si.diskLayout().catch(() => []),
    si.networkStats().catch(() => []),
  ]);

  const gpu = graphics?.controllers?.find((controller) => Boolean(controller.model || controller.vendor)) ?? null;
  const diskTotals = fsSizes.reduce((acc, item) => ({
    totalBytes: acc.totalBytes + Math.max(0, item.size || 0),
    usedBytes: acc.usedBytes + Math.max(0, item.used || 0),
  }), { totalBytes: 0, usedBytes: 0 });
  const network = networkStats.find((item) => (item.rx_sec || item.tx_sec) && item.operstate === 'up')
    ?? networkStats.find((item) => item.operstate === 'up')
    ?? networkStats[0]
    ?? null;
  const diskTemperature = diskLayouts
    .map((item) => positiveNumber(item.temperature))
    .find((value): value is number => value !== null) ?? null;
  const memoryTotal = memory?.total ?? os.totalmem();
  const memoryAvailable = memory?.available ?? os.freemem();
  const memoryUsed = memory?.used ?? Math.max(0, memoryTotal - memoryAvailable);

  return {
    timestamp: Date.now(),
    host: {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      uptimeSeconds: os.uptime(),
    },
    cpu: {
      manufacturer: cpu?.manufacturer || '',
      brand: cpu?.brand || os.cpus()[0]?.model || '',
      cores: cpu?.cores || os.cpus().length,
      physicalCores: cpu?.physicalCores || cpu?.cores || os.cpus().length,
      speedGhz: positiveNumber(cpu?.speed),
      speedMaxGhz: positiveNumber(cpu?.speedMax),
      loadPercent: clampPercent(load?.currentLoad),
      temperatureCelsius: positiveNumber(cpuTemperature?.main) ?? positiveNumber(cpuTemperature?.max),
    },
    memory: {
      totalBytes: memoryTotal,
      usedBytes: memoryUsed,
      availableBytes: memoryAvailable,
      usagePercent: memoryTotal > 0 ? clampPercent((memoryUsed / memoryTotal) * 100) : 0,
    },
    gpu: gpu
      ? {
        vendor: gpu.vendor || '',
        model: gpu.model || '',
        vramTotalMb: positiveNumber(gpu.vram) ?? positiveNumber(gpu.memoryTotal),
        loadPercent: finiteNumber(gpu.utilizationGpu) === null ? null : clampPercent(gpu.utilizationGpu),
        temperatureCelsius: positiveNumber(gpu.temperatureGpu),
      }
      : null,
    disk: {
      totalBytes: diskTotals.totalBytes,
      usedBytes: diskTotals.usedBytes,
      usagePercent: diskTotals.totalBytes > 0 ? clampPercent((diskTotals.usedBytes / diskTotals.totalBytes) * 100) : 0,
      temperatureCelsius: diskTemperature,
    },
    network: {
      iface: network?.iface || '',
      rxBytesPerSecond: Math.max(0, network?.rx_sec || 0),
      txBytesPerSecond: Math.max(0, network?.tx_sec || 0),
    },
  };
}

/**
 * 注册系统相关 IPC 处理器
 * @description 注册任务管理器和运行进程查询的 IPC 事件处理器
 * @param options - 配置选项，包含进程查询函数
 */
export function registerSystemIpcHandlers(options: RegisterSystemIpcHandlersOptions): void {
  ipcMain.on('system:open-task-manager', () => {
    try {
      if (process.platform === 'win32') {
        exec('taskmgr');
      }
    } catch (err) {
      console.error('[System] open-task-manager error:', err);
    }
  });

  ipcMain.handle('system:running-processes:get', async () => {
    if (process.platform !== 'win32') return [];
    return options.queryRunningNonSystemProcessNames();
  });

  ipcMain.handle('system:running-processes:with-icons:get', async () => {
    if (process.platform !== 'win32') return [];
    return options.queryRunningNonSystemProcessesWithIcons();
  });

  ipcMain.handle('system:open-windows:with-icons:get', async () => {
    if (process.platform !== 'win32') return [];
    return options.queryOpenWindowsWithIcons();
  });

  ipcMain.handle('system:focused-window:get', async () => {
    if (process.platform !== 'win32') return null;
    return options.queryFocusedWindow();
  });

  ipcMain.handle('system:performance-snapshot:get', async () => {
    return collectPerformanceSnapshot();
  });

}
