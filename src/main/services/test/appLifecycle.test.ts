import { beforeEach, describe, expect, it, vi } from 'vitest';

const { appOnMock } = vi.hoisted(() => ({
  appOnMock: vi.fn(),
}));

vi.mock('electron', () => ({
  app: { on: appOnMock },
  BrowserWindow: class {},
}));

import { registerAppLifecycleHandlers } from '../appLifecycle';

describe('registerAppLifecycleHandlers', () => {
  const handlers = new Map<string, () => void>();

  beforeEach(() => {
    handlers.clear();
    appOnMock.mockReset();
    appOnMock.mockImplementation((event: string, handler: () => void) => {
      handlers.set(event, handler);
    });
  });

  it('restores and focuses minimized main window on second-instance', () => {
    const restore = vi.fn();
    const focus = vi.fn();

    registerAppLifecycleHandlers({
      getMainWindow: () => ({
        isDestroyed: () => false,
        isMinimized: () => true,
        restore,
        focus,
      } as any),
      onWillQuit: vi.fn(),
      onWindowAllClosed: vi.fn(),
    });

    handlers.get('second-instance')?.();

    expect(restore).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('ignores second-instance when window is missing or destroyed', () => {
    registerAppLifecycleHandlers({
      getMainWindow: () => null,
      onWillQuit: vi.fn(),
      onWindowAllClosed: vi.fn(),
    });

    expect(() => handlers.get('second-instance')?.()).not.toThrow();
  });

  it('delegates will-quit and window-all-closed callbacks', () => {
    const onWillQuit = vi.fn();
    const onWindowAllClosed = vi.fn();

    registerAppLifecycleHandlers({
      getMainWindow: () => null,
      onWillQuit,
      onWindowAllClosed,
    });

    handlers.get('will-quit')?.();
    handlers.get('window-all-closed')?.();

    expect(onWillQuit).toHaveBeenCalledTimes(1);
    expect(onWindowAllClosed).toHaveBeenCalledTimes(1);
  });
});
