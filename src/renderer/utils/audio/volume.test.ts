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
 * @file volume.test.ts
 * @description 单元测试文件
 * @author 鸡哥
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readEffectiveAudioVolume, clampVolume } from './volume';

describe('audio volume utils', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        api: {
          storeRead: vi.fn(async (key: string) => {
            if (key === 'sound-volume-global') return 0.8;
            if (key === 'sound-volume-alarm') return 0.5;
            if (key === 'sound-volume-effect') return 2;
            return null;
          }),
        },
      },
      configurable: true,
      writable: true,
    });
  });

  it('clamps invalid and out-of-range values', () => {
    expect(clampVolume(Number.NaN)).toBe(1);
    expect(clampVolume(-1)).toBe(0);
    expect(clampVolume(2)).toBe(1);
    expect(clampVolume(0.6)).toBe(0.6);
  });

  it('combines global and category volume', async () => {
    await expect(readEffectiveAudioVolume('alarm')).resolves.toBe(0.4);
    await expect(readEffectiveAudioVolume('effect')).resolves.toBe(0.8);
  });
});
