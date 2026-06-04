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
 * @file useNavLayout.ts
 * @description 导航布局配置加载与监听 Hook
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import {
  MAXEXPAND_NAV_LAYOUT_STORE_KEY,
  normalizeMaxExpandNavLayoutConfig,
  type MaxExpandNavLayoutConfig,
} from '../components/setting/utils/settingsConfig';

interface UseNavLayoutResult {
  navLayoutConfig: MaxExpandNavLayoutConfig;
  navLayoutLoaded: boolean;
}

/**
 * 加载并监听 MaxExpand 导航布局配置。
 * @returns 导航布局配置与加载状态。
 */
export function useNavLayout(): UseNavLayoutResult {
  const [navLayoutConfig, setNavLayoutConfig] = useState<MaxExpandNavLayoutConfig>([]);
  const [navLayoutLoaded, setNavLayoutLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(MAXEXPAND_NAV_LAYOUT_STORE_KEY).then((data: unknown) => {
      if (cancelled) return;
      const normalized = normalizeMaxExpandNavLayoutConfig(data);
      setNavLayoutConfig(normalized);
      setNavLayoutLoaded(true);
    }).catch(() => {});
    const unsub = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${MAXEXPAND_NAV_LAYOUT_STORE_KEY}`) {
        setNavLayoutConfig(normalizeMaxExpandNavLayoutConfig(value));
      }
    });
    const handleLocalChange = (e: Event): void => {
      if (cancelled) return;
      const detail = (e as CustomEvent).detail;
      setNavLayoutConfig(normalizeMaxExpandNavLayoutConfig(detail));
    };
    window.addEventListener('maxexpand-nav-layout-changed', handleLocalChange);
    return () => { cancelled = true; unsub(); window.removeEventListener('maxexpand-nav-layout-changed', handleLocalChange); };
  }, []);

  return { navLayoutConfig, navLayoutLoaded };
}
