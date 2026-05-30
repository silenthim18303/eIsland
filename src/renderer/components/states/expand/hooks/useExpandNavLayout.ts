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
 * @file useExpandNavLayout.ts
 * @description 展开导航布局配置与性能模式 Hook
 * @author 鸡哥
 */

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_EXPAND_NAV_LAYOUT,
  EXPAND_NAV_LAYOUT_STORE_KEY,
  normalizeExpandNavLayoutConfig,
  type ExpandNavLayoutConfig,
} from '../../maxExpand/components/setting/utils/settingsConfig';
import {
  MAXEXPAND_PERFORMANCE_MODE_STORE_KEY,
  cacheMaxExpandPerformanceModeEnabled,
  normalizeMaxExpandPerformanceModeEnabled,
  readCachedMaxExpandPerformanceModeEnabled,
} from '../../maxExpand/components/setting/utils/performanceSettings';
import { preloadMaxExpandContentEager } from '../../maxExpand/maxExpandContentEagerLoader';

/**
 * 管理展开导航布局配置和性能模式设置
 * @returns navLayoutConfig - 当前导航布局配置
 * @returns maxExpandPerformanceModeEnabled - 性能模式是否启用
 * @returns preloadEagerWhenPerformanceModeDisabled - 非性能模式下预加载大展开内容
 */
export function useExpandNavLayout() {
  const [navLayoutConfig, setNavLayoutConfig] = useState<ExpandNavLayoutConfig>(DEFAULT_EXPAND_NAV_LAYOUT);
  const [maxExpandPerformanceModeEnabled, setMaxExpandPerformanceModeEnabled] = useState(readCachedMaxExpandPerformanceModeEnabled);

  const preloadEagerWhenPerformanceModeDisabled = useCallback((): void => {
    if (!maxExpandPerformanceModeEnabled) {
      preloadMaxExpandContentEager();
    }
  }, [maxExpandPerformanceModeEnabled]);

  useEffect(() => {
    let cancelled = false;

    // 读取并监听导航布局配置
    window.api.storeRead(EXPAND_NAV_LAYOUT_STORE_KEY).then((data: unknown) => {
      if (cancelled) return;
      setNavLayoutConfig(normalizeExpandNavLayoutConfig(data));
    }).catch(() => {});
    const unsubExpand = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${EXPAND_NAV_LAYOUT_STORE_KEY}`) {
        setNavLayoutConfig(normalizeExpandNavLayoutConfig(value));
      }
    });
    const handleLocalExpandLayoutChange = (e: Event): void => {
      if (cancelled) return;
      const detail = (e as CustomEvent).detail;
      setNavLayoutConfig(normalizeExpandNavLayoutConfig(detail));
    };
    window.addEventListener('expand-nav-layout-changed', handleLocalExpandLayoutChange);

    // 读取并监听性能模式设置
    if (!readCachedMaxExpandPerformanceModeEnabled()) {
      preloadMaxExpandContentEager();
    }
    window.api.storeRead(MAXEXPAND_PERFORMANCE_MODE_STORE_KEY).then((value: unknown) => {
      if (cancelled) return;
      const enabled = normalizeMaxExpandPerformanceModeEnabled(value);
      cacheMaxExpandPerformanceModeEnabled(enabled);
      setMaxExpandPerformanceModeEnabled(enabled);
      if (!enabled) preloadMaxExpandContentEager();
    }).catch(() => {});
    const unsubscribe = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${MAXEXPAND_PERFORMANCE_MODE_STORE_KEY}`) {
        const enabled = normalizeMaxExpandPerformanceModeEnabled(value);
        cacheMaxExpandPerformanceModeEnabled(enabled);
        setMaxExpandPerformanceModeEnabled(enabled);
        if (!enabled) preloadMaxExpandContentEager();
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
      unsubExpand();
      window.removeEventListener('expand-nav-layout-changed', handleLocalExpandLayoutChange);
    };
  }, []);

  return { navLayoutConfig, maxExpandPerformanceModeEnabled, preloadEagerWhenPerformanceModeDisabled };
}
