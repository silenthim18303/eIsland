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
 * @file useNotificationFavorites.ts
 * @description 通知 URL 收藏状态管理 Hook
 * @author 鸡哥
 */

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { URL_FAVORITES_STORE_KEY } from '../config/notificationConstants';
import { sanitizeFavorites } from '../utils/notificationHelpers';

interface UseNotificationFavoritesResult {
  favoriteUrlSet: Set<string>;
  setFavoriteUrlSet: Dispatch<SetStateAction<Set<string>>>;
}

/**
 * 加载并维护当前剪贴板 URL 的收藏状态集合。
 * @param type - 通知类型。
 * @param urls - 剪贴板 URL 列表。
 * @returns 收藏 URL 集合（小写）及其 setter。
 */
export function useNotificationFavorites(
  type: string | undefined,
  urls: string[] | undefined,
): UseNotificationFavoritesResult {
  const [favoriteUrlSet, setFavoriteUrlSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (type !== 'clipboard-url') return;
    let cancelled = false;
    window.api.storeRead(URL_FAVORITES_STORE_KEY).then((data) => {
      if (cancelled) return;
      const items = sanitizeFavorites(data);
      if (items.length > 0) {
        setFavoriteUrlSet(new Set(items.map(item => item.url.toLowerCase())));
        return;
      }
      try {
        const raw = localStorage.getItem('eIsland_url_favorites');
        const fallbackItems = raw ? sanitizeFavorites(JSON.parse(raw) as unknown[]) : [];
        setFavoriteUrlSet(new Set(fallbackItems.map(item => item.url.toLowerCase())));
      } catch {
        setFavoriteUrlSet(new Set());
      }
    }).catch(() => {
      try {
        const raw = localStorage.getItem('eIsland_url_favorites');
        const fallbackItems = raw ? sanitizeFavorites(JSON.parse(raw) as unknown[]) : [];
        if (!cancelled) setFavoriteUrlSet(new Set(fallbackItems.map(item => item.url.toLowerCase())));
      } catch {
        if (!cancelled) setFavoriteUrlSet(new Set());
      }
    });

    return () => {
      cancelled = true;
    };
  }, [type, urls]);

  return { favoriteUrlSet, setFavoriteUrlSet };
}
