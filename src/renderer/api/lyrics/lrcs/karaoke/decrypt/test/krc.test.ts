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
 * @file krc.test.ts
 * @description decryptKRC 单元测试 — mock inflateAuto
 * @author 鸡哥
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { inflateAuto } from '../inflate';
import { decryptKRC } from '../krc';

vi.mock('../inflate', () => ({
  inflateAuto: vi.fn(),
}));

describe('decryptKRC', () => {
  const mockInflate = vi.mocked(inflateAuto);

  beforeEach(() => {
    mockInflate.mockReset();
  });

  it('valid base64 cipher with mocked inflate returns decrypted text', async () => {
    // 8 bytes: 4-byte header (skipped) + 4-byte body (XOR'd then inflated)
    const data = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x41, 0x42, 0x43, 0x44]);
    const b64 = btoa(String.fromCharCode(...data));

    // Code always skips at least 1 byte (bomLen=1 when no BOM present),
    // so prepend a dummy byte before the actual text payload.
    const inflated = new Uint8Array([0x00, ...new TextEncoder().encode('Hello')]);
    mockInflate.mockResolvedValue(inflated);

    const result = await decryptKRC(b64);

    expect(result).toBe('Hello');
    expect(mockInflate).toHaveBeenCalledOnce();
    // Verify inflateAuto received a Uint8Array of the XOR'd body (length = decoded - 4)
    const calledWith = mockInflate.mock.calls[0][0];
    expect(calledWith).toBeInstanceOf(Uint8Array);
    expect(calledWith.length).toBe(4);
  });

  it('empty input throws "decoded too short"', async () => {
    // atob('') -> 0 bytes, which is <= 4
    await expect(decryptKRC('')).rejects.toThrow('KRC: decoded too short');
    expect(mockInflate).not.toHaveBeenCalled();
  });

  it('BOM (0xEF 0xBB 0xBF) is skipped — 3 bytes consumed instead of 1', async () => {
    const data = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04]);
    const b64 = btoa(String.fromCharCode(...data));

    const bom = [0xef, 0xbb, 0xbf];
    const text = new TextEncoder().encode('BOM Test');
    mockInflate.mockResolvedValue(new Uint8Array([...bom, ...text]));

    const result = await decryptKRC(b64);

    expect(result).toBe('BOM Test');
  });

  it('inflated data with length <= bomLen throws', async () => {
    const data = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04]);
    const b64 = btoa(String.fromCharCode(...data));

    // Only 1 byte — bomLen=1, length(1) <= 1 → throw
    mockInflate.mockResolvedValue(new Uint8Array([0x42]));

    await expect(decryptKRC(b64)).rejects.toThrow(/inflated too short after skip/);
  });
});
