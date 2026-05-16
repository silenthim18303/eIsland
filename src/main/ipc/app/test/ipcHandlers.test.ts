import { beforeEach, describe, expect, it, vi } from 'vitest';

const { handleMock, onMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
  onMock: vi.fn(),
}));

const {
  existsSyncMock,
  readFileSyncMock,
  writeFileSyncMock,
  broadcastSettingChangeMock,
} = vi.hoisted(() => ({
  existsSyncMock: vi.fn(),
  readFileSyncMock: vi.fn(),
  writeFileSyncMock: vi.fn(),
  broadcastSettingChangeMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: handleMock,
    on: onMock,
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

import { registerStoreIpcHandlers } from '../store';
import { registerLogIpcHandlers } from '../log';

describe('app ipc handlers', () => {
  const handleHandlers = new Map<string, (...args: any[]) => any>();
  const onHandlers = new Map<string, (...args: any[]) => any>();

  beforeEach(() => {
    handleHandlers.clear();
    onHandlers.clear();
    handleMock.mockReset();
    onMock.mockReset();
    existsSyncMock.mockReset();
    readFileSyncMock.mockReset();
    writeFileSyncMock.mockReset();
    broadcastSettingChangeMock.mockReset();

    handleMock.mockImplementation((channel: string, handler: (...args: any[]) => any) => {
      handleHandlers.set(channel, handler);
    });
    onMock.mockImplementation((channel: string, handler: (...args: any[]) => any) => {
      onHandlers.set(channel, handler);
    });
  });

  it('registers and handles store read/write', () => {
    registerStoreIpcHandlers({ storeDir: 'C:/store' });

    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(JSON.stringify({ a: 1 }));

    const read = handleHandlers.get('store:read');
    const write = handleHandlers.get('store:write');
    expect(read?.({}, 'config')).toEqual({ a: 1 });

    const result = write?.({ sender: { id: 9 } }, 'config', { b: 2 });
    expect(result).toBe(true);
    expect(writeFileSyncMock).toHaveBeenCalled();
    expect(broadcastSettingChangeMock).toHaveBeenCalledWith(9, 'store:config', { b: 2 });
  });

  it('registers and normalizes log write levels', () => {
    const writeMainLog = vi.fn();
    registerLogIpcHandlers({ writeMainLog });

    const handler = onHandlers.get('log:write');
    handler?.({}, 'warn', 'w');
    handler?.({}, 'error', 'e');
    handler?.({}, 'other', 'i');

    expect(writeMainLog).toHaveBeenNthCalledWith(1, 'warn', 'w');
    expect(writeMainLog).toHaveBeenNthCalledWith(2, 'error', 'e');
    expect(writeMainLog).toHaveBeenNthCalledWith(3, 'info', 'i');
  });
});
