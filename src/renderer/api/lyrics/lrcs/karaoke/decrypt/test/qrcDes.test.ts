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
 * @file qrcDes.test.ts
 * @description qrcTripleDesDecrypt 单元测试
 * @author 鸡哥
 */

import { describe, expect, it } from 'vitest';
import { qrcTripleDesDecrypt } from '../qrcDes';

describe('qrcTripleDesDecrypt', () => {
  it('empty string input returns empty Uint8Array', () => {
    const result = qrcTripleDesDecrypt('');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });

  it('valid hex cipher returns Uint8Array', () => {
    // 8 bytes = 16 hex chars, minimum valid input for a single DES block
    const cipher = '0011223344556677';
    const result = qrcTripleDesDecrypt(cipher);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(8);
  });

  it('output is Uint8Array instance', () => {
    const cipher = 'AABBCCDDEEFF0011';
    const result = qrcTripleDesDecrypt(cipher);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).not.toBeInstanceOf(Array);
  });

  it('odd-length hex throws error', () => {
    expect(() => qrcTripleDesDecrypt('ABC')).toThrow('QRC: hex string has odd length');
  });

  it('invalid hex does not crash', () => {
    expect(() => {
      try {
        qrcTripleDesDecrypt('ZZZZZZZZZZZZZZZZ');
      } catch {
        // expected
      }
    }).not.toThrow();
  });

  it('ciphertext not aligned to 8-byte blocks throws error', () => {
    // 4 bytes = 8 hex chars, not 8-byte aligned
    expect(() => qrcTripleDesDecrypt('AABBCCDD')).toThrow('QRC: ciphertext length not aligned to 8-byte blocks');
  });
});
