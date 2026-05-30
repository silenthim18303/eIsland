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
 * @file userAccountApi.wallpaper.test.ts
 * @description 壁纸市场相关接口单元测试。
 * @author 鸡哥
 */

import { describe, expect, it, vi } from 'vitest';

const requestMock = vi.hoisted(() => vi.fn());

vi.mock('../userAccountApi.client', () => ({
  request: requestMock,
  buildUploadHeaders: vi.fn(),
  parsePayload: vi.fn(),
  USER_ACCOUNT_API_BASE: 'https://test.server.pyisland.com/api',
}));

import {
  normalizeWallpaperMarketListData,
  listUserWallpapers,
  deleteUserWallpaper,
} from '../userAccountApi.wallpaper';

describe('normalizeWallpaperMarketListData', () => {
  it('returns items and null total when given an array', () => {
    const arr = [
      { id: 1, ownerUsername: 'a', title: 't', description: 'd', type: 'image' as const, status: 'published' },
    ];
    const result = normalizeWallpaperMarketListData(arr);
    expect(result.items).toBe(arr);
    expect(result.total).toBeNull();
  });

  it('returns items and total when given a valid WallpaperMarketListData object', () => {
    const data = {
      items: [
        { id: 2, ownerUsername: 'b', title: 't2', description: 'd2', type: 'video' as const, status: 'published' },
      ],
      total: 42,
    };
    const result = normalizeWallpaperMarketListData(data);
    expect(result.items).toBe(data.items);
    expect(result.total).toBe(42);
  });

  it('returns null total when the object has a non-finite total', () => {
    const data = {
      items: [
        { id: 3, ownerUsername: 'c', title: 't3', description: 'd3', type: 'image' as const, status: 'published' },
      ],
      total: Infinity,
    };
    const result = normalizeWallpaperMarketListData(data);
    expect(result.items).toBe(data.items);
    expect(result.total).toBeNull();
  });

  it('returns null total when the object has a negative total', () => {
    const data = {
      items: [
        { id: 4, ownerUsername: 'd', title: 't4', description: 'd4', type: 'image' as const, status: 'published' },
      ],
      total: -1,
    };
    const result = normalizeWallpaperMarketListData(data);
    expect(result.items).toBe(data.items);
    expect(result.total).toBeNull();
  });

  it('returns empty items and null total for undefined input', () => {
    const result = normalizeWallpaperMarketListData(undefined);
    expect(result.items).toEqual([]);
    expect(result.total).toBeNull();
  });

  it('returns empty items and null total for null input', () => {
    const result = normalizeWallpaperMarketListData(null as unknown as undefined);
    expect(result.items).toEqual([]);
    expect(result.total).toBeNull();
  });

  it('returns empty items and null total for a non-object type (string)', () => {
    const result = normalizeWallpaperMarketListData('bad' as unknown as undefined);
    expect(result.items).toEqual([]);
    expect(result.total).toBeNull();
  });

  it('returns empty items and null total for a non-object type (number)', () => {
    const result = normalizeWallpaperMarketListData(123 as unknown as undefined);
    expect(result.items).toEqual([]);
    expect(result.total).toBeNull();
  });
});

describe('listUserWallpapers', () => {
  it('calls request with the correct path and GET method', async () => {
    requestMock.mockResolvedValueOnce({ ok: true, code: 200, message: 'success', data: [] });
    await listUserWallpapers('tok', { keyword: 'nature', type: 'image', sort: 'newest', page: 2, pageSize: 10 });
    expect(requestMock).toHaveBeenCalledWith(
      '/v1/user/wallpapers/list?keyword=nature&type=image&sort=newest&page=2&pageSize=10',
      { method: 'GET', auth: 'tok' },
    );
  });

  it('calls request with no query suffix when params are empty', async () => {
    requestMock.mockResolvedValueOnce({ ok: true, code: 200, message: 'success', data: [] });
    await listUserWallpapers('tok');
    expect(requestMock).toHaveBeenCalledWith(
      '/v1/user/wallpapers/list',
      { method: 'GET', auth: 'tok' },
    );
  });
});

describe('deleteUserWallpaper', () => {
  it('calls request with the correct path and DELETE method', async () => {
    requestMock.mockResolvedValueOnce({ ok: true, code: 200, message: 'success' });
    await deleteUserWallpaper('tok', 99);
    expect(requestMock).toHaveBeenCalledWith(
      '/v1/user/wallpapers/delete?id=99',
      { method: 'DELETE', auth: 'tok' },
    );
  });
});
