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
  hardwareOptions: PerformanceHardwareOptions;
}

interface PerformanceHardwareOption {
  id: string;
  label: string;
}

interface PerformanceHardwareOptions {
  cpu: PerformanceHardwareOption[];
  gpu: PerformanceHardwareOption[];
  disk: PerformanceHardwareOption[];
}

interface PerformanceHardwareSelection {
  cpu?: string;
  gpu?: string;
  disk?: string;
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

function indexedId(prefix: string, index: number): string {
  return `${prefix}:${index}`;
}

function parseIndexedId(value: unknown, prefix: string, total: number): number | null {
  if (typeof value !== 'string') return null;
  const match = value.match(new RegExp(`^${prefix}:(\\d+)$`));
  if (!match) return null;
  const index = Number(match[1]);
  return Number.isInteger(index) && index >= 0 && index < total ? index : null;
}

function safeHardwareLabel(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

async function collectPerformanceSnapshot(selection: PerformanceHardwareSelection = {}): Promise<PerformanceSnapshot> {
  const [
    cpu,
    load,
    cpuTemperature,
    memory,
    graphics,
    fsSizes,
    diskLayouts,
  ] = await Promise.all([
    si.cpu().catch(() => null),
    si.currentLoad().catch(() => null),
    si.cpuTemperature().catch(() => null),
    si.mem().catch(() => null),
    si.graphics().catch(() => null),
    si.fsSize().catch(() => []),
    si.diskLayout().catch(() => []),
  ]);

  const cpuLoadItems = Array.isArray(load?.cpus) ? load.cpus : [];
  const selectedCpuIndex = parseIndexedId(selection.cpu, 'cpu', cpuLoadItems.length);
  const cpuOptions: PerformanceHardwareOption[] = [
    { id: 'all', label: 'All CPU' },
    ...cpuLoadItems.map((_, index) => ({
      id: indexedId('cpu', index),
      label: `CPU ${index + 1} · ${safeHardwareLabel(os.cpus()[index]?.model, 'Unknown CPU')}`,
    })),
  ];
  const selectedCpuLoad = selectedCpuIndex === null ? load?.currentLoad : cpuLoadItems[selectedCpuIndex]?.load;
  const cpuTemperatureCores = Array.isArray(cpuTemperature?.cores) ? cpuTemperature.cores : [];
  const selectedCpuTemperature = selectedCpuIndex === null ? null : positiveNumber(cpuTemperatureCores[selectedCpuIndex]);

  const gpuControllers = (graphics?.controllers ?? []).filter((controller) => Boolean(controller.model || controller.vendor));
  const selectedGpuIndex = parseIndexedId(selection.gpu, 'gpu', gpuControllers.length);
  const gpu = selectedGpuIndex === null ? (gpuControllers[0] ?? null) : gpuControllers[selectedGpuIndex];
  const gpuOptions: PerformanceHardwareOption[] = [
    { id: 'auto', label: 'Auto GPU' },
    ...gpuControllers.map((controller, index) => ({
      id: indexedId('gpu', index),
      label: [controller.vendor, controller.model].filter(Boolean).join(' ') || `GPU ${index + 1}`,
    })),
  ];

  const fsItems = fsSizes.filter((item) => positiveNumber(item.size) !== null);
  const selectedFsIndex = parseIndexedId(selection.disk, 'fs', fsItems.length);
  const selectedFsItems = selectedFsIndex === null ? fsItems : [fsItems[selectedFsIndex]];
  const diskOptions: PerformanceHardwareOption[] = [
    { id: 'all', label: 'All Disks' },
    ...fsItems.map((item, index) => ({
      id: indexedId('fs', index),
      label: [item.mount, item.fs].filter(Boolean).join(' · ') || `Disk ${index + 1}`,
    })),
  ];
  const diskTotals = selectedFsItems.reduce((acc, item) => ({
    totalBytes: acc.totalBytes + Math.max(0, item.size || 0),
    usedBytes: acc.usedBytes + Math.max(0, item.used || 0),
  }), { totalBytes: 0, usedBytes: 0 });
  const selectedDiskTemperature = selectedFsIndex === null ? null : positiveNumber(diskLayouts[selectedFsIndex]?.temperature);
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
      loadPercent: clampPercent(selectedCpuLoad),
      temperatureCelsius: selectedCpuTemperature ?? positiveNumber(cpuTemperature?.main) ?? positiveNumber(cpuTemperature?.max),
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
      temperatureCelsius: selectedDiskTemperature ?? diskTemperature,
    },
    hardwareOptions: {
      cpu: cpuOptions,
      gpu: gpuOptions,
      disk: diskOptions,
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

  ipcMain.handle('system:performance-snapshot:get', async (_event, selection?: PerformanceHardwareSelection) => {
    return collectPerformanceSnapshot(selection);
  });

}
