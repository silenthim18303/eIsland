import { describe, expect, it } from 'vitest';

const detector = require('../') as {
  getForegroundFullscreenWindow: () => {
    title: string;
    processId: number;
    isForeground: boolean;
    bounds: {
      left: number;
      top: number;
      right: number;
      bottom: number;
      width: number;
      height: number;
    };
    monitor: {
      left: number;
      top: number;
      right: number;
      bottom: number;
      width: number;
      height: number;
      isPrimary: boolean;
    };
  } | null;
  getFullscreenWindows: () => Array<{
    hwnd: string;
    title: string;
    processId: number;
    isForeground: boolean;
    bounds: {
      left: number;
      top: number;
      right: number;
      bottom: number;
      width: number;
      height: number;
    };
    monitor: {
      left: number;
      top: number;
      right: number;
      bottom: number;
      width: number;
      height: number;
      isPrimary: boolean;
    };
  }>;
  isAnyFullscreenWindow: () => boolean;
};

describe('windows-fullscreen-detector', () => {
  it('exports detector methods and result shape', () => {
    expect(typeof detector.getForegroundFullscreenWindow).toBe('function');
    expect(typeof detector.getFullscreenWindows).toBe('function');
    expect(typeof detector.isAnyFullscreenWindow).toBe('function');

    const foreground = detector.getForegroundFullscreenWindow();
    const list = detector.getFullscreenWindows();

    expect(foreground === null || typeof foreground === 'object').toBe(true);
    expect(Array.isArray(list)).toBe(true);
    expect(detector.isAnyFullscreenWindow()).toBeTypeOf('boolean');

    for (const item of list) {
      expect(item.hwnd).toBeTypeOf('string');
      expect(item.title).toBeTypeOf('string');
      expect(item.processId).toBeTypeOf('number');
      expect(item.isForeground).toBeTypeOf('boolean');
      expect(item.bounds.left).toBeTypeOf('number');
      expect(item.bounds.top).toBeTypeOf('number');
      expect(item.bounds.right).toBeTypeOf('number');
      expect(item.bounds.bottom).toBeTypeOf('number');
      expect(item.bounds.width).toBeTypeOf('number');
      expect(item.bounds.height).toBeTypeOf('number');
      expect(item.monitor.isPrimary).toBeTypeOf('boolean');
    }
  });
});