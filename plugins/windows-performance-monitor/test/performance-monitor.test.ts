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
 * @file performance-monitor.test.ts
 * @description Windows 性能采集插件单元测试
 * @description 验证 CPU 与内存原生采集方法的导出与返回结构
 * @author 鸡哥
 */

import { describe, expect, it } from 'vitest';

const monitor = require('../') as {
  getCpu: () => {
    usagePercent: number;
    hasBaseline: boolean;
  };
  getMemory: () => {
    totalBytes: number;
    usedBytes: number;
    availableBytes: number;
    usagePercent: number;
  };
};

describe('windows-performance-monitor', () => {
  it('exports CPU and memory snapshot methods', () => {
    expect(typeof monitor.getCpu).toBe('function');
    expect(typeof monitor.getMemory).toBe('function');
  });

  it('returns CPU snapshot shape after baseline warmup', () => {
    monitor.getCpu();
    const cpu = monitor.getCpu();

    expect(cpu.usagePercent).toBeTypeOf('number');
    expect(cpu.hasBaseline).toBe(true);
    expect(cpu.usagePercent).toBeGreaterThanOrEqual(0);
    expect(cpu.usagePercent).toBeLessThanOrEqual(100);
  });

  it('returns memory snapshot shape', () => {
    const memory = monitor.getMemory();

    expect(memory.totalBytes).toBeTypeOf('number');
    expect(memory.usedBytes).toBeTypeOf('number');
    expect(memory.availableBytes).toBeTypeOf('number');
    expect(memory.usagePercent).toBeTypeOf('number');
    expect(memory.totalBytes).toBeGreaterThan(0);
    expect(memory.usedBytes).toBeGreaterThanOrEqual(0);
    expect(memory.availableBytes).toBeGreaterThanOrEqual(0);
    expect(memory.usagePercent).toBeGreaterThanOrEqual(0);
    expect(memory.usagePercent).toBeLessThanOrEqual(100);
  });
});