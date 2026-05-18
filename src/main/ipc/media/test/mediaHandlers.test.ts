import { beforeEach, describe, expect, it, vi } from 'vitest';

const { handleMock, getAllWindowsMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
  getAllWindowsMock: vi.fn(),
}));

const {
  existsSyncMock,
  readFileSyncMock,
  writeFileSyncMock,
} = vi.hoisted(() => ({
  existsSyncMock: vi.fn(),
  readFileSyncMock: vi.fn(),
  writeFileSyncMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: handleMock,
  },
  BrowserWindow: {
    getAllWindows: getAllWindowsMock,
  },
}));

vi.mock('fs', () => ({
  existsSync: existsSyncMock,
  readFileSync: readFileSyncMock,
  writeFileSync: writeFileSyncMock,
}));

import { registerMediaIpcHandlers } from '../media';
import { registerMusicIpcHandlers } from '../music';

describe('media ipc handlers', () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();

  beforeEach(() => {
    handlers.clear();
    handleMock.mockReset();
    getAllWindowsMock.mockReset();
    existsSyncMock.mockReset();
    readFileSyncMock.mockReset();
    writeFileSyncMock.mockReset();

    handleMock.mockImplementation((channel: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(channel, handler);
    });
  });

  it('handles media keys with whitelist guard', () => {
    const sendMediaVirtualKey = vi.fn();
    registerMediaIpcHandlers({
      getMainWindow: () => null,
      sendMediaVirtualKey,
      isWhitelisted: () => false,
      getPendingSourceSwitchId: () => '',
      setPendingSourceSwitchId: vi.fn(),
      getPendingSourceSwitchEntry: () => null,
      clearPendingSourceSwitchEntry: vi.fn(),
      getCurrentDeviceId: () => 'device-1',
      setCurrentDeviceId: vi.fn(),
      getSmtcSessionRuntime: () => new Map(),
    });

    handlers.get('media:play-pause')?.({});
    handlers.get('media:next')?.({});
    handlers.get('media:prev')?.({});

    expect(sendMediaVirtualKey).toHaveBeenCalledTimes(1);
    expect(sendMediaVirtualKey).toHaveBeenCalledWith(0xB3);
  });

  it('returns current info and applies source switch updates', () => {
    const setPendingSourceSwitchId = vi.fn();
    const clearPendingSourceSwitchEntry = vi.fn();
    let currentDeviceId = 'device-1';
    const setCurrentDeviceId = vi.fn((id: string) => {
      currentDeviceId = id;
    });
    const sessionRuntime = new Map<string, { payload: unknown; hasTitle: boolean }>([
      ['device-2', { payload: { title: 'Hello' }, hasTitle: true }],
      ['device-1', { payload: { title: 'NoTitle' }, hasTitle: false }],
    ]);

    const aliveWindow = {
      isDestroyed: vi.fn(() => false),
      webContents: { send: vi.fn() },
    };
    const deadWindow = {
      isDestroyed: vi.fn(() => true),
      webContents: { send: vi.fn() },
    };
    getAllWindowsMock.mockReturnValue([aliveWindow, deadWindow]);

    registerMediaIpcHandlers({
      getMainWindow: () => null,
      sendMediaVirtualKey: vi.fn(),
      isWhitelisted: () => true,
      getPendingSourceSwitchId: () => 'device-2',
      setPendingSourceSwitchId,
      getPendingSourceSwitchEntry: () => ({ some: 'entry' }),
      clearPendingSourceSwitchEntry,
      getCurrentDeviceId: () => currentDeviceId,
      setCurrentDeviceId,
      getSmtcSessionRuntime: () => sessionRuntime,
    });

    expect(handlers.get('media:current-info:get')?.({})).toBeNull();

    handlers.get('media:accept-source-switch')?.({});

    expect(setCurrentDeviceId).toHaveBeenCalledWith('device-2');
    expect(setPendingSourceSwitchId).toHaveBeenCalledWith('');
    expect(clearPendingSourceSwitchEntry).toHaveBeenCalled();
    expect(aliveWindow.webContents.send).toHaveBeenCalledWith('nowplaying:info', { title: 'Hello' });
    expect(deadWindow.webContents.send).not.toHaveBeenCalled();

    handlers.get('media:reject-source-switch')?.({});
    expect(setPendingSourceSwitchId).toHaveBeenCalledTimes(2);
    expect(clearPendingSourceSwitchEntry).toHaveBeenCalledTimes(2);
  });

  it('handles music persistence and fallback branches', async () => {
    const setWhitelist = vi.fn();
    const setSmtcUnsubscribeMs = vi.fn();
    const sanitizeSmtcUnsubscribeMs = vi.fn((v: unknown) => Number(v) || 3000);

    registerMusicIpcHandlers({
      storeDir: 'C:/store',
      whitelistStoreKey: 'whitelist',
      lyricsSourceStoreKey: 'lyricsSource',
      lyricsKaraokeStoreKey: 'lyricsKaraoke',
      lyricsClockStoreKey: 'lyricsClock',
      smtcUnsubscribeStoreKey: 'smtcUnsubscribe',
      defaultLyricsKaraoke: true,
      defaultLyricsClock: false,
      getWhitelist: () => ['A', 'B'],
      setWhitelist,
      readLyricsSourceConfig: () => 'netease',
      getSmtcUnsubscribeMs: () => 2500,
      setSmtcUnsubscribeMs,
      sanitizeSmtcUnsubscribeMs,
      detectAllSources: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ sourceAppId: 'spotify', isPlaying: true, hasTitle: true, thumbnail: null }])
        .mockRejectedValueOnce(new Error('boom')),
    });

    expect(handlers.get('music:whitelist:get')?.({})).toEqual(['A', 'B']);
    expect(handlers.get('music:whitelist:set')?.({}, ['C'])).toBe(true);
    expect(setWhitelist).toHaveBeenCalledWith(['C']);
    expect(writeFileSyncMock).toHaveBeenCalled();

    writeFileSyncMock.mockImplementationOnce(() => {
      throw new Error('disk full');
    });
    expect(handlers.get('music:lyrics-source:set')?.({}, 'qqmusic')).toBe(false);

    existsSyncMock.mockReturnValue(false);
    expect(handlers.get('music:lyrics-karaoke:get')?.({})).toBe(true);

    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue('false');
    expect(handlers.get('music:lyrics-clock:get')?.({})).toBe(false);

    expect(handlers.get('music:smtc-unsubscribe-ms:get')?.({})).toBe(2500);
    expect(handlers.get('music:smtc-unsubscribe-ms:set')?.({}, 1234)).toBe(true);
    expect(sanitizeSmtcUnsubscribeMs).toHaveBeenCalledWith(1234);
    expect(setSmtcUnsubscribeMs).toHaveBeenCalledWith(1234);

    const detect = handlers.get('music:detect-source-app-id');
    await expect(detect?.({})).resolves.toEqual({ ok: false, sources: [], message: '当前无播放程序' });
    await expect(detect?.({})).resolves.toEqual({
      ok: true,
      sources: [{ sourceAppId: 'spotify', isPlaying: true, hasTitle: true, thumbnail: null }],
      message: '',
    });
    await expect(detect?.({})).resolves.toEqual({ ok: false, sources: [], message: '读取会话异常' });
  });
});
