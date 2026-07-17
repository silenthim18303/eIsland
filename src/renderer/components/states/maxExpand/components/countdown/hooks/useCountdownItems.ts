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
 * @file useCountdownItems.ts
 * @description 倒数日条目管理 hook：加载、持久化、删除。
 * @author 鸡哥
 */

import { useState, useEffect, useCallback } from 'react';
import { STORE_KEY } from '../config/countdownConfig';
import { normalizeImageSource } from '../utils/countdownUtils';
import type { CountdownItem, UseCountdownItemsReturn } from '../types/countdownTypes';

/** 管理倒数日条目的加载、持久化与删除 */
export function useCountdownItems(): UseCountdownItemsReturn & { removeItem: (id: number) => void } {
  const [items, setItems] = useState<CountdownItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  /** 加载 */
  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(STORE_KEY).then(async (data) => {
      if (cancelled) return;
      if (Array.isArray(data)) {
        const normalized = await Promise.all((data as CountdownItem[]).map(async (item) => ({
          ...item,
          backgroundImage: await normalizeImageSource(item.backgroundImage),
        })));
        if (!cancelled) setItems(normalized);
      }
      setLoaded(true);
    }).catch(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  /** 持久化 */
  useEffect(() => {
    if (!loaded) return;
    window.api.storeWrite(STORE_KEY, items).catch(() => {});
  }, [items, loaded]);

  /** 删除 */
  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  return { items, setItems, loaded, removeItem };
}
