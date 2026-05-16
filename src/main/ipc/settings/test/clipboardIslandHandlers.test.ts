import { beforeEach, describe, expect, it, vi } from 'vitest';

const { handleMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
}));

const {
  clipboardReadTextMock,
  clipboardWriteTextMock,
  shellOpenExternalMock,
} = vi.hoisted(() => ({
  clipboardReadTextMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
  shellOpenExternalMock: vi.fn(),
}));

const {
  writeFileSyncMock,
  existsSyncMock,
  readFileSyncMock,
} = vi.hoisted(() => ({
  writeFileSyncMock: vi.fn(),
  existsSyncMock: vi.fn(),
  readFileSyncMock: vi.fn(),
}));

const { broadcastSettingChangeMock } = vi.hoisted(() => ({
  broadcastSettingChangeMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: { handle: handleMock },
  clipboard: {
    readText: clipboardReadTextMock,
    writeText: clipboardWriteTextMock,
  },
  shell: {
    openExternal: shellOpenExternalMock,
  },
  app: {
    setLoginItemSettings: vi.fn(),
  },
}));

vi.mock('fs', () => ({
  writeFileSync: writeFileSyncMock,
  existsSync: existsSyncMock,
  readFileSync: readFileSyncMock,
}));

vi.mock('../../../utils/broadcast', () => ({
  broadcastSettingChange: broadcastSettingChangeMock,
}));

import { registerClipboardIpcHandlers } from '../clipboard';
import { registerIslandIpcHandlers } from '../island';

describe('settings ipc handlers', () => {
  const handlers = new Map<string, (...args: any[]) => any>();

  beforeEach(() => {
    handlers.clear();
    handleMock.mockReset();
    clipboardReadTextMock.mockReset();
    clipboardWriteTextMock.mockReset();
    shellOpenExternalMock.mockReset();
    writeFileSyncMock.mockReset();
    existsSyncMock.mockReset();
    readFileSyncMock.mockReset();
    broadcastSettingChangeMock.mockReset();

    handleMock.mockImplementation((channel: string, handler: (...args: any[]) => any) => {
      handlers.set(channel, handler);
    });
  });

  it('registers clipboard handlers and supports read/write/open url', async () => {
    const options = {
      storeDir: 'C:/store',
      monitorEnabledStoreKey: 'm',
      detectModeStoreKey: 'd',
      blacklistStoreKey: 'b',
      defaultDetectMode: 'https-only' as const,
      getMonitorEnabled: vi.fn(() => false),
      setMonitorEnabled: vi.fn(),
      getDetectMode: vi.fn(() => 'https-only' as const),
      setDetectMode: vi.fn(),
      getBlacklist: vi.fn(() => []),
      setBlacklist: vi.fn(),
      startWatcher: vi.fn(),
      stopWatcher: vi.fn(),
    };

    registerClipboardIpcHandlers(options);

    clipboardReadTextMock.mockReturnValue('abc');
    const read = handlers.get('clipboard:read-text');
    const write = handlers.get('clipboard:write-text');
    const open = handlers.get('clipboard:open-url');

    expect(read?.()).toBe('abc');
    expect(write?.({}, 'hi')).toBe(true);
    expect(clipboardWriteTextMock).toHaveBeenCalledWith('hi');

    shellOpenExternalMock.mockResolvedValue(undefined);
    await expect(open?.({}, 'https://example.com')).resolves.toBe(true);
    await expect(open?.({}, 'file:///abc')).resolves.toBe(false);
  });

  it('handles clipboard blacklist and monitor toggle persistence', () => {
    const state = {
      blacklist: ['example.com'],
      enabled: false,
    };

    registerClipboardIpcHandlers({
      storeDir: 'C:/store',
      monitorEnabledStoreKey: 'm',
      detectModeStoreKey: 'd',
      blacklistStoreKey: 'b',
      defaultDetectMode: 'https-only',
      getMonitorEnabled: () => state.enabled,
      setMonitorEnabled: (v) => { state.enabled = v; },
      getDetectMode: () => 'https-only',
      setDetectMode: vi.fn(),
      getBlacklist: () => state.blacklist,
      setBlacklist: (next) => { state.blacklist = next; },
      startWatcher: vi.fn(),
      stopWatcher: vi.fn(),
    });

    const setList = handlers.get('clipboard:url-blacklist:set');
    const setMonitor = handlers.get('clipboard:url-monitor:set');

    expect(setList?.({ sender: { id: 3 } }, ['https://a.com', 'a.com', ''])).toBe(true);
    expect(writeFileSyncMock).toHaveBeenCalled();
    expect(broadcastSettingChangeMock).toHaveBeenCalledWith(3, 'clipboard:url-blacklist', ['a.com']);

    expect(setMonitor?.({ sender: { id: 4 } }, true)).toBe(true);
    expect(state.enabled).toBe(true);
  });

  it('registers island handlers and normalizes read/write values', () => {
    registerIslandIpcHandlers({
      storeDir: 'C:/store',
      islandOpacityStoreKey: 'op',
      expandMouseleaveIdleStoreKey: 'exp',
      maxExpandMouseleaveIdleStoreKey: 'max',
      idleClickExpandStoreKey: 'idle',
      autostartModeStoreKey: 'auto',
      navOrderStoreKey: 'nav',
    });

    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(JSON.stringify(150));

    const getOpacity = handlers.get('island:opacity:get');
    const setOpacity = handlers.get('island:opacity:set');
    const getNav = handlers.get('island:nav-order:get');

    expect(getOpacity?.()).toBe(100);
    expect(setOpacity?.({ sender: { id: 7 } }, 5)).toBe(true);
    expect(writeFileSyncMock).toHaveBeenCalled();
    expect(broadcastSettingChangeMock).toHaveBeenCalledWith(7, 'island:opacity', 10);

    readFileSyncMock.mockReturnValue(JSON.stringify(['a', 'b']));
    expect(getNav?.()).toEqual({ visibleOrder: ['a', 'b'], hiddenOrder: [] });
  });
});
