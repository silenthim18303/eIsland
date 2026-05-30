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
 * @file index.test.ts
 * @description 单元测试文件
 * @author 鸡哥
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateTotpFromBase32Seed } from '..';

describe('generateTotpFromBase32Seed', () => {
  const validSeed = 'JBSWY3DPEHPK3PXP';
  const fakeTimestamp = 1700000000;

  /** Fixed 20-byte SHA-1 hash used as mock HMAC output */
  const fixedHash = new Uint8Array([
    0x1f, 0x86, 0x95, 0x73, 0x42, 0xab, 0xcd, 0xef,
    0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
    0xfe, 0xdc, 0xba, 0x98,
  ]);

  /**
   * Compute the expected TOTP from the fixed hash for given digits.
   *
   * offset  = 0x98 & 0x0f = 8
   * binary  = (0x01<<24)|(0x23<<16)|(0x45<<8)|0x67 = 19088743
   * 6-digit: 19088743 % 1_000_000 = 88743  => "088743"
   * 8-digit: 19088743 % 100_000_000 = 19088743 => "19088743"
   */
  const mockImportKey = vi.fn().mockResolvedValue('mock-hmac-key');
  const mockSign = vi.fn().mockResolvedValue(fixedHash.buffer);

  beforeEach(() => {
    vi.restoreAllMocks();
    mockImportKey.mockClear();
    mockSign.mockClear();

    mockImportKey.mockResolvedValue('mock-hmac-key');
    mockSign.mockResolvedValue(fixedHash.buffer);

    Object.defineProperty(globalThis, 'crypto', {
      value: {
        subtle: {
          importKey: mockImportKey,
          sign: mockSign,
        },
      },
      writable: true,
      configurable: true,
    });
  });

  it('空种子应抛出 TOTP Seed 为空', async () => {
    await expect(generateTotpFromBase32Seed('', fakeTimestamp))
      .rejects.toThrow('TOTP Seed 为空');
    await expect(generateTotpFromBase32Seed('   ', fakeTimestamp))
      .rejects.toThrow('TOTP Seed 为空');
  });

  it('含非法字符的种子应抛出 TOTP Seed 格式错误', async () => {
    await expect(generateTotpFromBase32Seed('1', fakeTimestamp))
      .rejects.toThrow('TOTP Seed 格式错误');
    await expect(generateTotpFromBase32Seed('ABCDEFGH0', fakeTimestamp))
      .rejects.toThrow('TOTP Seed 格式错误');
    await expect(generateTotpFromBase32Seed('ABCDEFGH!', fakeTimestamp))
      .rejects.toThrow('TOTP Seed 格式错误');
  });

  it('有效种子应返回默认 6 位 TOTP 字符串', async () => {
    const otp = await generateTotpFromBase32Seed(validSeed, fakeTimestamp);
    expect(otp).toBe('088743');
    expect(otp).toHaveLength(6);
    expect(mockImportKey).toHaveBeenCalledOnce();
    expect(mockSign).toHaveBeenCalledOnce();
  });

  it('自定义 digits 参数应生效', async () => {
    const otp = await generateTotpFromBase32Seed(validSeed, fakeTimestamp, 30, 8);
    expect(otp).toBe('19088743');
    expect(otp).toHaveLength(8);
  });

  it('自定义 period 参数应改变 counter 计算', async () => {
    await generateTotpFromBase32Seed(validSeed, fakeTimestamp, 60, 6);

    const signArgs = mockSign.mock.calls[0];
    expect(signArgs[0]).toBe('HMAC');
    expect(signArgs[1]).toBe('mock-hmac-key');

    const counterBytes = signArgs[2];
    const expectedCounter = Math.floor(fakeTimestamp / 60);
    const bytes = new Uint8Array(8);
    let value = expectedCounter;
    for (let i = 7; i >= 0; i--) {
      bytes[i] = value & 0xff;
      value = Math.floor(value / 256);
    }
    expect(new Uint8Array(counterBytes)).toEqual(bytes);
  });

  it('crypto.subtle 不可用时应抛出 WebCrypto 不可用', async () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {},
      writable: true,
      configurable: true,
    });
    await expect(generateTotpFromBase32Seed(validSeed, fakeTimestamp))
      .rejects.toThrow('WebCrypto 不可用');

    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    await expect(generateTotpFromBase32Seed(validSeed, fakeTimestamp))
      .rejects.toThrow('WebCrypto 不可用');
  });
});
