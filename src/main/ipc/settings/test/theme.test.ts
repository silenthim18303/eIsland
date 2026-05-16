import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  handleMock,
  existsSyncMock,
  readFileSyncMock,
  writeFileSyncMock,
  broadcastSettingChangeMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  existsSyncMock: vi.fn(),
  readFileSyncMock: vi.fn(),
  writeFileSyncMock: vi.fn(),
  broadcastSettingChangeMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: handleMock,
  },
}));

vi.mock('fs', () => ({
  existsSync: existsSyncMock,
  readFileSync: readFileSyncMock,
  writeFileSync: writeFileSyncMock,
}));

vi.mock('../../../utils/broadcast', () => ({
  broadcastSettingChange: broadcastSettingChangeMock,
}));

import { registerThemeIpcHandlers } from '../theme';

describe('registerThemeIpcHandlers', () => {
  const handlers = new Map<string, (...args: any[]) => any>();

  beforeEach(() => {
    handlers.clear();
    handleMock.mockReset();
    existsSyncMock.mockReset();
    readFileSyncMock.mockReset();
    writeFileSyncMock.mockReset();
    broadcastSettingChangeMock.mockReset();

    handleMock.mockImplementation((channel: string, handler: (...args: any[]) => any) => {
      handlers.set(channel, handler);
    });

    registerThemeIpcHandlers({
      storeDir: 'C:/store',
      themeModeStoreKey: 'theme-mode',
    });
  });

  it('registers get/set handlers', () => {
    expect(handleMock).toHaveBeenCalledTimes(2);
    expect(handlers.has('theme:mode:get')).toBe(true);
    expect(handlers.has('theme:mode:set')).toBe(true);
  });

  it('returns dark when persisted file is missing', () => {
    existsSyncMock.mockReturnValue(false);

    const getHandler = handlers.get('theme:mode:get');
    expect(getHandler).toBeTypeOf('function');
    expect(getHandler?.()).toBe('dark');
  });

  it('normalizes invalid mode to dark and broadcasts change', () => {
    const setHandler = handlers.get('theme:mode:set');
    const event = { sender: { id: 42 } };

    const result = setHandler?.(event, 'invalid-mode');

    expect(result).toBe(true);
    expect(writeFileSyncMock).toHaveBeenCalledTimes(1);
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      expect.stringContaining('theme-mode.json'),
      JSON.stringify('dark', null, 2),
      'utf-8'
    );
    expect(broadcastSettingChangeMock).toHaveBeenCalledWith(42, 'theme:mode', 'dark');
  });

  it('returns false when persisting throws', () => {
    const setHandler = handlers.get('theme:mode:set');
    const event = { sender: { id: 1 } };
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    writeFileSyncMock.mockImplementation(() => {
      throw new Error('write failed');
    });

    const result = setHandler?.(event, 'light');
    expect(result).toBe(false);
    consoleErrorSpy.mockRestore();
  });

  it('returns dark for invalid persisted value', () => {
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(JSON.stringify('invalid'));

    const getHandler = handlers.get('theme:mode:get');
    expect(getHandler?.()).toBe('dark');
  });
});
