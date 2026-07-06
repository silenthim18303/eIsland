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
 * @file icon.test.ts
 * @description @eisland/windows-application-icon-helper 单元测试
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

interface IconResult {
  data: Buffer;
  size: number;
  format: 'png';
}

const icon = require('../') as {
  getIconByProcessName(processName: string): IconResult | null;
  getIconByPid(pid: number): IconResult | null;
  getIconByPath(exePath: string): IconResult | null;
  getIconByShortcutPath(lnkPath: string): IconResult | null;
};

/** 验证返回的 IconResult 是有效的 */
function expectValidIconResult(result: IconResult) {
  expect(result).not.toBeNull();
  expect(result.data).toBeDefined();
  expect(Buffer.isBuffer(result.data)).toBe(true);
  expect(result.data.length).toBeGreaterThan(0);
  // PNG magic bytes: 89 50 4E 47 (‰PNG)
  expect(result.data[0]).toBe(0x89);
  expect(result.data[1]).toBe(0x50);
  expect(result.data[2]).toBe(0x4e);
  expect(result.data[3]).toBe(0x47);
  expect(result.size).toBe(result.data.length);
  expect(result.format).toBe('png');
}

describe('@eisland/windows-application-icon-helper', () => {
  it('exports all expected functions', () => {
    expect(typeof icon.getIconByProcessName).toBe('function');
    expect(typeof icon.getIconByPid).toBe('function');
    expect(typeof icon.getIconByPath).toBe('function');
    expect(typeof icon.getIconByShortcutPath).toBe('function');
  });

  describe('getIconByProcessName', () => {
    it('returns Buffer for running process', () => {
      const result = icon.getIconByProcessName('explorer');
      expect(result).not.toBeNull();
      if (result) expectValidIconResult(result);
    });

    it('returns null for non-existent process', () => {
      const result = icon.getIconByProcessName('nonexistent_process_12345');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = icon.getIconByProcessName('');
      expect(result).toBeNull();
    });

    it('never throws', () => {
      expect(() => icon.getIconByProcessName('explorer')).not.toThrow();
      expect(() => icon.getIconByProcessName('nonexistent')).not.toThrow();
      expect(() => icon.getIconByProcessName('')).not.toThrow();
    });
  });

  describe('getIconByPid', () => {
    it('returns Buffer for current process', () => {
      const result = icon.getIconByPid(process.pid);
      expect(result).not.toBeNull();
      if (result) expectValidIconResult(result);
    });

    it('returns null for PID 0', () => {
      const result = icon.getIconByPid(0);
      expect(result).toBeNull();
    });

    it('returns null for non-existent PID', () => {
      const result = icon.getIconByPid(99999999);
      expect(result).toBeNull();
    });

    it('never throws', () => {
      expect(() => icon.getIconByPid(process.pid)).not.toThrow();
      expect(() => icon.getIconByPid(0)).not.toThrow();
      expect(() => icon.getIconByPid(99999999)).not.toThrow();
    });
  });

  describe('getIconByPath', () => {
    it('returns Buffer for valid exe path', () => {
      const result = icon.getIconByPath(process.execPath);
      expect(result).not.toBeNull();
      if (result) expectValidIconResult(result);
    });

    it('returns Buffer for non-exe file (file type icon)', () => {
      const result = icon.getIconByPath('C:\\Windows\\System32\\drivers\\etc\\hosts');
      expect(result).not.toBeNull();
      if (result) expectValidIconResult(result);
    });

    it('returns null for non-existent path', () => {
      const result = icon.getIconByPath('C:\\nonexistent\\file.exe');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = icon.getIconByPath('');
      expect(result).toBeNull();
    });

    it('never throws', () => {
      expect(() => icon.getIconByPath(process.execPath)).not.toThrow();
      expect(() => icon.getIconByPath('C:\\nonexistent')).not.toThrow();
      expect(() => icon.getIconByPath('')).not.toThrow();
    });
  });

  describe('getIconByShortcutPath', () => {
    it('returns Buffer for valid shortcut', () => {
      // 查找一个可用的快捷方式
      const startMenuPath = path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs');
      let lnkPath: string | null = null;

      try {
        const walk = (dir: string): string[] => {
          const results: string[] = [];
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              results.push(...walk(fullPath));
            } else if (entry.name.endsWith('.lnk')) {
              results.push(fullPath);
            }
          }
          return results;
        };
        const lnks = walk(startMenuPath);
        if (lnks.length > 0) lnkPath = lnks[0];
      } catch { /* ignore */ }

      if (!lnkPath) return; // skip if no shortcuts found

      const result = icon.getIconByShortcutPath(lnkPath);
      expect(result).not.toBeNull();
      if (result) expectValidIconResult(result);
    });

    it('returns null for non-existent path', () => {
      const result = icon.getIconByShortcutPath('C:\\nonexistent\\file.lnk');
      expect(result).toBeNull();
    });

    it('returns null for non-lnk file', () => {
      const result = icon.getIconByShortcutPath('C:\\Windows\\notepad.exe');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = icon.getIconByShortcutPath('');
      expect(result).toBeNull();
    });

    it('never throws', () => {
      expect(() => icon.getIconByShortcutPath('C:\\nonexistent.lnk')).not.toThrow();
      expect(() => icon.getIconByShortcutPath('C:\\Windows\\notepad.exe')).not.toThrow();
      expect(() => icon.getIconByShortcutPath('')).not.toThrow();
    });
  });
});
