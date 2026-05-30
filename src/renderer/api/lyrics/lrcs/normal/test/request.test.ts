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
 * @file request.test.ts
 * @description 歌词网络请求封装单元测试
 * @author 鸡哥
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

const loadNetworkConfig = vi.hoisted(() => vi.fn());
const logger = vi.hoisted(() => ({
  info: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../../../../../store/utils/storage', () => ({ loadNetworkConfig }));
vi.mock('../../../../../utils/logger', () => ({ logger }));

describe('requestJsonWithLog', () => {
  let netFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    loadNetworkConfig.mockReturnValue({ timeoutMs: 5000 });
    netFetch = vi.fn();
    Object.defineProperty(globalThis, 'window', {
      value: { api: { netFetch } },
      configurable: true,
      writable: true,
    });
  });

  it('returns parsed JSON on success', async () => {
    const payload = { title: 'hello', count: 42 };
    netFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: JSON.stringify(payload),
    });

    const { requestJsonWithLog } = await import('../request');
    const result = await requestJsonWithLog<typeof payload>('https://example.com/api');

    expect(result).toEqual(payload);
  });

  it('returns null on non-ok response', async () => {
    netFetch.mockResolvedValue({
      ok: false,
      status: 404,
      body: 'Not Found',
    });

    const { requestJsonWithLog } = await import('../request');
    const result = await requestJsonWithLog('https://example.com/api');

    expect(result).toBeNull();
  });

  it('returns null on JSON parse failure', async () => {
    netFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: 'not valid json',
    });

    const { requestJsonWithLog } = await import('../request');
    const result = await requestJsonWithLog('https://example.com/api');

    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalled();
  });

  it('uses correct method, headers, and body', async () => {
    netFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: JSON.stringify({ ok: true }),
    });

    const { requestJsonWithLog } = await import('../request');
    await requestJsonWithLog('https://example.com/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"key":"value"}',
    });

    expect(netFetch).toHaveBeenCalledWith('https://example.com/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"key":"value"}',
      timeoutMs: 5000,
    });
  });

  it('uses GET method by default', async () => {
    netFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: JSON.stringify({}),
    });

    const { requestJsonWithLog } = await import('../request');
    await requestJsonWithLog('https://example.com/api');

    expect(netFetch).toHaveBeenCalledWith('https://example.com/api', {
      method: 'GET',
      headers: {},
      body: '',
      timeoutMs: 5000,
    });
  });
});

describe('requestTextWithLog', () => {
  let netFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    loadNetworkConfig.mockReturnValue({ timeoutMs: 5000 });
    netFetch = vi.fn();
    Object.defineProperty(globalThis, 'window', {
      value: { api: { netFetch } },
      configurable: true,
      writable: true,
    });
  });

  it('returns text body on success', async () => {
    netFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: 'plain text content',
    });

    const { requestTextWithLog } = await import('../request');
    const result = await requestTextWithLog('https://example.com/text');

    expect(result).toBe('plain text content');
  });

  it('returns null on non-ok response', async () => {
    netFetch.mockResolvedValue({
      ok: false,
      status: 500,
      body: 'Internal Server Error',
    });

    const { requestTextWithLog } = await import('../request');
    const result = await requestTextWithLog('https://example.com/text');

    expect(result).toBeNull();
  });

  it('returns null when body is null', async () => {
    netFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: null,
    });

    const { requestTextWithLog } = await import('../request');
    const result = await requestTextWithLog('https://example.com/text');

    expect(result).toBeNull();
  });

  it('uses correct method and headers', async () => {
    netFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: 'ok',
    });

    const { requestTextWithLog } = await import('../request');
    await requestTextWithLog('https://example.com/text', {
      method: 'PUT',
      headers: { Accept: 'text/plain' },
    });

    expect(netFetch).toHaveBeenCalledWith('https://example.com/text', {
      method: 'PUT',
      headers: { Accept: 'text/plain' },
      body: '',
      timeoutMs: 5000,
    });
  });
});
