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
 * @file updaterService.test.ts
 * @description 单元测试文件
 * @author 鸡哥
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getAllWindowsMock } = vi.hoisted(() => ({
  getAllWindowsMock: vi.fn(),
}));

vi.mock('electron', () => ({
  BrowserWindow: {
    getAllWindows: getAllWindowsMock,
  },
}));

import { initUpdaterService } from '../updaterService';

describe('initUpdaterService', () => {
  const listeners = new Map<string, (...args: any[]) => void>();
  const send = vi.fn();

  const createUpdater = () => ({
    autoDownload: true,
    autoInstallOnAppQuit: true,
    allowPrerelease: true,
    forceDevUpdateConfig: false,
    logger: null,
    on: vi.fn((event: string, handler: (...args: any[]) => void) => {
      listeners.set(event, handler);
    }),
  });

  beforeEach(() => {
    vi.useFakeTimers();
    listeners.clear();
    send.mockReset();
    getAllWindowsMock.mockReset();
    getAllWindowsMock.mockReturnValue([
      { isDestroyed: () => false, webContents: { send } },
      { isDestroyed: () => true, webContents: { send } },
    ]);
  });

  it('registers updater listeners and emits renderer events', () => {
    const updater = createUpdater();

    initUpdaterService({
      updater: updater as any,
      getMainWindow: () => null,
      getAppPath: () => '/app',
      isPackaged: () => true,
      autoCheckDelayMs: 100,
    });

    expect(updater.autoDownload).toBe(false);
    expect(updater.autoInstallOnAppQuit).toBe(false);
    expect(updater.allowPrerelease).toBe(false);
    expect(updater.forceDevUpdateConfig).toBe(true);
    expect(listeners.has('update-available')).toBe(true);

    listeners.get('update-available')?.({ version: '1.2.3', releaseNotes: 'notes' });
    expect(send).toHaveBeenCalledWith('updater:update-available', {
      version: '1.2.3',
      releaseNotes: 'notes',
    });

    listeners.get('download-progress')?.({
      percent: 55,
      transferred: 10,
      total: 20,
      bytesPerSecond: 30,
    });
    expect(send).toHaveBeenCalledWith('updater:download-progress', {
      percent: 55,
      transferred: 10,
      total: 20,
      bytesPerSecond: 30,
    });

    vi.advanceTimersByTime(100);
    expect(send).toHaveBeenCalledWith('updater:startup-auto-check-request', {
      requestedAt: expect.any(Number),
    });
  });

  it('skips startup auto-check event when disabled', () => {
    const updater = createUpdater();

    initUpdaterService({
      updater: updater as any,
      getMainWindow: () => null,
      getAppPath: () => '/app',
      isPackaged: () => false,
      shouldAutoPromptUpdate: () => false,
      autoCheckDelayMs: 50,
    });

    vi.advanceTimersByTime(50);

    expect(send).not.toHaveBeenCalledWith(
      'updater:startup-auto-check-request',
      expect.anything(),
    );
  });
});
