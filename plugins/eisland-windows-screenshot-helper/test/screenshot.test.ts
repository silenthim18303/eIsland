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
 * @file screenshot.test.ts
 * @description Windows 截图助手原生模块单元测试
 * @author 鸡哥
 */

import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const isWindows = process.platform === 'win32';
const nativeDllPath = path.join(__dirname, '..', 'src', 'bin', 'Release', 'net10.0-windows10.0.19041.0', 'win-x64', 'native', 'eIslandScreenshotHelper.dll');
const hasNativeDll = fs.existsSync(nativeDllPath);

interface ScreenshotResult {
  data: Buffer;
  size: number;
  format: 'png';
}

const screenshot = isWindows && hasNativeDll
  ? (require('../') as {
      capturePrimaryDisplayPng(): ScreenshotResult | null;
      getLastError(): string;
    })
  : null;

function expectValidPng(result: ScreenshotResult): void {
  expect(Buffer.isBuffer(result.data)).toBe(true);
  expect(result.data.length).toBeGreaterThan(0);
  expect(result.data[0]).toBe(0x89);
  expect(result.data[1]).toBe(0x50);
  expect(result.data[2]).toBe(0x4e);
  expect(result.data[3]).toBe(0x47);
  expect(result.size).toBe(result.data.length);
  expect(result.format).toBe('png');
}

describe.skipIf(!isWindows || !hasNativeDll)('@eisland/windows-screenshot-helper', () => {
  const mod = screenshot!;

  it('exports expected functions', () => {
    expect(typeof mod.capturePrimaryDisplayPng).toBe('function');
    expect(typeof mod.getLastError).toBe('function');
  });

  it('captures primary display as PNG buffer', () => {
    const result = mod.capturePrimaryDisplayPng();
    expect(result).not.toBeNull();
    if (result) expectValidPng(result);
  });

  it('does not throw on repeated capture', () => {
    expect(() => mod.capturePrimaryDisplayPng()).not.toThrow();
    expect(() => mod.capturePrimaryDisplayPng()).not.toThrow();
  });
});