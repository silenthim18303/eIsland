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
 * @file usePerformanceMode.ts
 * @description 监听 MaxExpand 性能模式开关状态
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import {
  MAXEXPAND_PERFORMANCE_MODE_STORE_KEY,
  cacheMaxExpandPerformanceModeEnabled,
  normalizeMaxExpandPerformanceModeEnabled,
  readCachedMaxExpandPerformanceModeEnabled,
} from '../components/setting/utils/performanceSettings';

/**
 * 监听并维护 MaxExpand 性能模式状态。
 * @returns 性能模式是否启用。
 */
export function usePerformanceMode(): boolean {
  const [enabled, setEnabled] = useState(readCachedMaxExpandPerformanceModeEnabled);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(MAXEXPAND_PERFORMANCE_MODE_STORE_KEY).then((value) => {
      if (cancelled) return;
      const normalized = normalizeMaxExpandPerformanceModeEnabled(value);
      cacheMaxExpandPerformanceModeEnabled(normalized);
      setEnabled(normalized);
    }).catch(() => {});
    const unsubscribe = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${MAXEXPAND_PERFORMANCE_MODE_STORE_KEY}`) {
        const normalized = normalizeMaxExpandPerformanceModeEnabled(value);
        cacheMaxExpandPerformanceModeEnabled(normalized);
        setEnabled(normalized);
      }
    });
    const handleLocalChange = (event: Event): void => {
      if (cancelled) return;
      const normalized = normalizeMaxExpandPerformanceModeEnabled((event as CustomEvent).detail);
      cacheMaxExpandPerformanceModeEnabled(normalized);
      setEnabled(normalized);
    };
    window.addEventListener('maxexpand-performance-mode-changed', handleLocalChange);
    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener('maxexpand-performance-mode-changed', handleLocalChange);
    };
  }, []);

  return enabled;
}
