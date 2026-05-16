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
