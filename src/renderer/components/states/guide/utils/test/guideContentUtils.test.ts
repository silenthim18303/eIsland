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
 * @file guideContentUtils.test.ts
 * @description guideContentUtils.ts 单元测试
 * @author 鸡哥
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ---------- hoisted mocks ---------- */

const { storeReadMock } = vi.hoisted(() => ({
  storeReadMock: vi.fn(),
}));

/* ---------- canvas / Image browser mocks ---------- */

let imageOnload: (() => void) | null;
let imageOnerror: (() => void) | null;

const mockGetImageData = vi.fn();
const mockDrawImage = vi.fn();
const mockGetContext = vi.fn();
const mockCreateElement = vi.fn();

function mockBrowserGlobals(): void {
  imageOnload = null;
  imageOnerror = null;

  // Mock Image – capture onload / onerror, trigger via helper
  class MockImage {
    set onload(fn: (() => void) | null) { imageOnload = fn; }
    set onerror(fn: (() => void) | null) { imageOnerror = fn; }
    set src(_v: string) { /* no-op */ }
  }
  (globalThis as any).Image = MockImage;

  // Mock document.createElement to return a canvas-like object
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: mockGetContext,
  };
  mockCreateElement.mockReturnValue(mockCanvas);
  (globalThis as any).document = { createElement: mockCreateElement };

  // Define window on globalThis (node env has no window)
  Object.defineProperty(globalThis, 'window', {
    value: { api: { storeRead: storeReadMock } },
    writable: true,
    configurable: true,
  });
}

/* ---------- import after mocks ---------- */

let extractDominantColor: (src: string) => Promise<[number, number, number]>;
let readStandaloneWindowMode: () => Promise<'integrated' | 'standalone'>;
let STANDALONE_WINDOW_MODE_STORE_KEY: string;
let LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY: string;

beforeEach(async () => {
  mockBrowserGlobals();
  vi.resetModules();
  const mod = await import('../guideContentUtils');
  extractDominantColor = mod.extractDominantColor;
  readStandaloneWindowMode = mod.readStandaloneWindowMode;
  STANDALONE_WINDOW_MODE_STORE_KEY = mod.STANDALONE_WINDOW_MODE_STORE_KEY;
  LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY = mod.LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY;
});

/* ---------- tests: constants ---------- */

describe('STANDALONE_WINDOW_MODE_STORE_KEY', () => {
  it('equals "standalone-window-mode"', () => {
    expect(STANDALONE_WINDOW_MODE_STORE_KEY).toBe('standalone-window-mode');
  });
});

describe('LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY', () => {
  it('equals "countdown-window-mode"', () => {
    expect(LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY).toBe('countdown-window-mode');
  });
});

/* ---------- tests: extractDominantColor ---------- */

describe('extractDominantColor', () => {
  it('returns pixel RGB when image loads successfully', async () => {
    mockGetContext.mockReturnValue({
      drawImage: mockDrawImage,
      getImageData: mockGetImageData.mockReturnValue({ data: [12, 34, 56, 255] }),
    });

    const promise = extractDominantColor('data:image/png;base64,abc');
    imageOnload!();
    expect(await promise).toEqual([12, 34, 56]);
  });

  it('draws image onto a 1x1 canvas', async () => {
    mockGetContext.mockReturnValue({
      drawImage: mockDrawImage,
      getImageData: mockGetImageData.mockReturnValue({ data: [0, 0, 0, 255] }),
    });

    const promise = extractDominantColor('img.png');
    imageOnload!();
    await promise;

    expect(mockCreateElement).toHaveBeenCalledWith('canvas');
    expect(mockDrawImage).toHaveBeenCalled();
  });

  it('resolves [100,100,100] when canvas getContext returns null', async () => {
    mockGetContext.mockReturnValue(null);

    const promise = extractDominantColor('img.png');
    imageOnload!();
    expect(await promise).toEqual([100, 100, 100]);
  });

  it('resolves [100,100,100] when image fails to load', async () => {
    const promise = extractDominantColor('bad.png');
    imageOnerror!();
    expect(await promise).toEqual([100, 100, 100]);
  });

  it('resolves [0,0,0] for a fully black pixel', async () => {
    mockGetContext.mockReturnValue({
      drawImage: mockDrawImage,
      getImageData: mockGetImageData.mockReturnValue({ data: [0, 0, 0, 255] }),
    });

    const promise = extractDominantColor('black.png');
    imageOnload!();
    expect(await promise).toEqual([0, 0, 0]);
  });

  it('resolves [255,255,255] for a fully white pixel', async () => {
    mockGetContext.mockReturnValue({
      drawImage: mockDrawImage,
      getImageData: mockGetImageData.mockReturnValue({ data: [255, 255, 255, 255] }),
    });

    const promise = extractDominantColor('white.png');
    imageOnload!();
    expect(await promise).toEqual([255, 255, 255]);
  });
});

/* ---------- tests: readStandaloneWindowMode ---------- */

describe('readStandaloneWindowMode', () => {
  it('returns "standalone" when primary store returns "standalone"', async () => {
    storeReadMock.mockResolvedValue('standalone');
    expect(await readStandaloneWindowMode()).toBe('standalone');
    expect(storeReadMock).toHaveBeenCalledWith(STANDALONE_WINDOW_MODE_STORE_KEY);
  });

  it('returns "integrated" when primary store returns "integrated"', async () => {
    storeReadMock.mockResolvedValue('integrated');
    expect(await readStandaloneWindowMode()).toBe('integrated');
  });

  it('falls back to legacy and returns "standalone" when primary value is unexpected', async () => {
    storeReadMock
      .mockResolvedValueOnce('unknown-value')
      .mockResolvedValueOnce('standalone');
    expect(await readStandaloneWindowMode()).toBe('standalone');
    expect(storeReadMock).toHaveBeenCalledWith(LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY);
  });

  it('returns "integrated" when primary value is unexpected and legacy is not "standalone"', async () => {
    storeReadMock
      .mockResolvedValueOnce('something')
      .mockResolvedValueOnce('integrated');
    expect(await readStandaloneWindowMode()).toBe('integrated');
  });

  it('falls back to legacy "standalone" when primary storeRead throws', async () => {
    storeReadMock
      .mockRejectedValueOnce(new Error('store error'))
      .mockResolvedValueOnce('standalone');
    expect(await readStandaloneWindowMode()).toBe('standalone');
  });

  it('returns "integrated" when primary throws and legacy is not "standalone"', async () => {
    storeReadMock
      .mockRejectedValueOnce(new Error('store error'))
      .mockResolvedValueOnce('integrated');
    expect(await readStandaloneWindowMode()).toBe('integrated');
  });

  it('returns "integrated" when both primary and legacy throw', async () => {
    storeReadMock
      .mockRejectedValueOnce(new Error('primary fail'))
      .mockRejectedValueOnce(new Error('legacy fail'));
    expect(await readStandaloneWindowMode()).toBe('integrated');
  });

  it('does not read legacy key when primary returns a valid value', async () => {
    storeReadMock.mockResolvedValue('standalone');
    await readStandaloneWindowMode();
    expect(storeReadMock).toHaveBeenCalledTimes(1);
    expect(storeReadMock).toHaveBeenCalledWith(STANDALONE_WINDOW_MODE_STORE_KEY);
  });

  it('returns "integrated" when primary returns null', async () => {
    storeReadMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    expect(await readStandaloneWindowMode()).toBe('integrated');
  });

  it('returns "integrated" when primary returns undefined', async () => {
    storeReadMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    expect(await readStandaloneWindowMode()).toBe('integrated');
  });
});
