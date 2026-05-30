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
 * @file qrc.test.ts
 * @description decryptQRC 单元测试 — mock qrcTripleDesDecrypt + inflateAuto
 * @author 鸡哥
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { qrcTripleDesDecrypt } from '../qrcDes';
import { inflateAuto } from '../inflate';
import { decryptQRC } from '../qrc';

vi.mock('../qrcDes', () => ({
  qrcTripleDesDecrypt: vi.fn(),
}));

vi.mock('../inflate', () => ({
  inflateAuto: vi.fn(),
}));

describe('decryptQRC', () => {
  const mockDecrypt = vi.mocked(qrcTripleDesDecrypt);
  const mockInflate = vi.mocked(inflateAuto);

  beforeEach(() => {
    mockDecrypt.mockReset();
    mockInflate.mockReset();
  });

  it('valid hex cipher with mocked dependencies returns decrypted text', async () => {
    const hexCipher = 'AABBCCDDEEFF0011'; // 8 bytes = 16 hex chars
    const decrypted = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
    const textBytes = new TextEncoder().encode('Hello QRC');

    mockDecrypt.mockReturnValue(decrypted);
    mockInflate.mockResolvedValue(textBytes);

    const result = await decryptQRC(hexCipher);

    expect(result).toBe('Hello QRC');
    expect(mockDecrypt).toHaveBeenCalledWith(hexCipher);
    expect(mockInflate).toHaveBeenCalledWith(decrypted);
  });

  it('empty input handling — returns empty string when deps return empty', async () => {
    mockDecrypt.mockReturnValue(new Uint8Array(0));
    mockInflate.mockResolvedValue(new Uint8Array(0));

    const result = await decryptQRC('');

    expect(result).toBe('');
    expect(mockDecrypt).toHaveBeenCalledWith('');
    expect(mockInflate).toHaveBeenCalledWith(new Uint8Array(0));
  });

  it('error message includes QRC hint for short cipher (<= 128 bytes)', async () => {
    // 4 bytes = 8 hex chars, well under the 128-byte threshold
    const hexCipher = 'AABBCCDD';
    const decrypted = new Uint8Array([0x01, 0x02, 0x03, 0x04]);

    mockDecrypt.mockReturnValue(decrypted);
    mockInflate.mockRejectedValue(new Error('inflate failed'));

    const err = await decryptQRC(hexCipher).catch((e: Error) => e);

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toContain('QRC inflate');
    expect(err.message).toContain('可能是此曲无 QRC'); // 可能是此曲无 QRC
    expect(err.message).toContain('inflate failed');
    // Verify the head bytes are formatted correctly
    expect(err.message).toContain('[01 02 03 04]');
  });
});
