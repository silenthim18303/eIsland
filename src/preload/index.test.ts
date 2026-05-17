import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

type PreloadSetup = {
  sendMock: ReturnType<typeof vi.fn>;
  invokeMock: ReturnType<typeof vi.fn>;
  onMock: ReturnType<typeof vi.fn>;
  removeListenerMock: ReturnType<typeof vi.fn>;
  exposeInMainWorldMock: ReturnType<typeof vi.fn>;
  getPathForFileMock: ReturnType<typeof vi.fn>;
  electronAPI: Record<string, unknown>;
  handlerMap: Map<string, (...args: unknown[]) => void>;
};

const originalContextIsolated = Object.getOwnPropertyDescriptor(process, 'contextIsolated');

async function loadPreloadWithContextIsolation(contextIsolated: boolean): Promise<PreloadSetup> {
  vi.resetModules();

  const handlerMap = new Map<string, (...args: unknown[]) => void>();
  const sendMock = vi.fn();
  const invokeMock = vi.fn();
  const onMock = vi.fn((channel: string, handler: (...args: unknown[]) => void) => {
    handlerMap.set(channel, handler);
  });
  const removeListenerMock = vi.fn();
  const exposeInMainWorldMock = vi.fn();
  const getPathForFileMock = vi.fn(() => 'C:/mock/file.txt');
  const electronAPI = { platform: 'mock' };

  vi.doMock('electron', () => ({
    contextBridge: { exposeInMainWorld: exposeInMainWorldMock },
    ipcRenderer: {
      send: sendMock,
      invoke: invokeMock,
      on: onMock,
      removeListener: removeListenerMock,
    },
    webUtils: {
      getPathForFile: getPathForFileMock,
    },
  }));

  vi.doMock('@electron-toolkit/preload', () => ({
    electronAPI,
  }));

  Object.defineProperty(process, 'contextIsolated', {
    value: contextIsolated,
    configurable: true,
  });

  if (!(globalThis as any).window) {
    (globalThis as any).window = {};
  }

  await import('./index');

  return {
    sendMock,
    invokeMock,
    onMock,
    removeListenerMock,
    exposeInMainWorldMock,
    getPathForFileMock,
    electronAPI,
    handlerMap,
  };
}

describe('preload bridge', () => {
  beforeEach(() => {
    (globalThis as any).window = {};
  });

  afterAll(() => {
    if (originalContextIsolated) {
      Object.defineProperty(process, 'contextIsolated', originalContextIsolated);
      return;
    }
    Reflect.deleteProperty(process, 'contextIsolated');
  });

  it('exposes electron and api in context isolated mode and proxies ipc calls', async () => {
    const setup = await loadPreloadWithContextIsolation(true);

    expect(setup.exposeInMainWorldMock).toHaveBeenCalledWith('electron', setup.electronAPI);

    const apiCall = setup.exposeInMainWorldMock.mock.calls.find(([name]) => name === 'api');
    expect(apiCall).toBeTruthy();

    const api = apiCall?.[1] as Record<string, (...args: any[]) => any>;

    api.enableMousePassthrough();
    expect(setup.sendMock).toHaveBeenCalledWith('window:enable-mouse-passthrough');

    setup.invokeMock.mockResolvedValue({ x: 100, y: 200 });
    await api.getMousePosition();
    expect(setup.invokeMock).toHaveBeenCalledWith('window:get-mouse-position');

    const callback = vi.fn();
    const unsubscribe = api.onNowPlayingInfo(callback);
    const handler = setup.handlerMap.get('nowplaying:info');
    handler?.({}, { title: 't' });
    expect(callback).toHaveBeenCalledWith({ title: 't' });

    unsubscribe();
    expect(setup.removeListenerMock).toHaveBeenCalledWith('nowplaying:info', expect.any(Function));

    api.getPathForFile({} as File);
    expect(setup.getPathForFileMock).toHaveBeenCalledTimes(1);
  });

  it('assigns electron and api to window in non-isolated mode', async () => {
    const setup = await loadPreloadWithContextIsolation(false);
    const exposedWindow = (globalThis as any).window;

    expect(exposedWindow.electron).toBe(setup.electronAPI);
    expect(typeof exposedWindow.api).toBe('object');

    exposedWindow.api.windowClose();
    expect(setup.sendMock).toHaveBeenCalledWith('window:close');
    expect(setup.exposeInMainWorldMock).not.toHaveBeenCalled();
  });
});
