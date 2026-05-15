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
 * @file MaxExpandContent.tsx
 * @description 最大展开模式内容组件，独立于 Expanded 的大面板，包含 AI 对话和设置 Tab
 * @author 鸡哥
 */

import React, { useEffect, useState } from 'react';
import {
  MAXEXPAND_PERFORMANCE_MODE_STORE_KEY,
  cacheMaxExpandPerformanceModeEnabled,
  normalizeMaxExpandPerformanceModeEnabled,
  readCachedMaxExpandPerformanceModeEnabled,
} from './components/setting/utils/performanceSettings';
import { MaxExpandContentLazy } from './MaxExpandContentLazy';
import { MaxExpandContentShell } from './MaxExpandContentShell';
import {
  getLoadedMaxExpandContentEager,
  loadMaxExpandContentEager,
  preloadMaxExpandContentEager,
} from './maxExpandContentEagerLoader';

const MaxExpandContentEager = React.lazy(loadMaxExpandContentEager);
if (!readCachedMaxExpandPerformanceModeEnabled()) {
  preloadMaxExpandContentEager();
}

const renderEagerLoadingTab = (_activeTab: unknown, loadingFallback: React.ReactElement): React.ReactElement => loadingFallback;

/**
 * 最大展开模式内容组件
 * @description 渲染最大展开态的 Tab 内容与底部导航点
 */
export function MaxExpandContent(): React.ReactElement {
  const [performanceModeEnabled, setPerformanceModeEnabled] = useState(readCachedMaxExpandPerformanceModeEnabled);
  const [loadedEagerContent, setLoadedEagerContent] = useState(getLoadedMaxExpandContentEager);

  useEffect(() => {
    if (performanceModeEnabled || loadedEagerContent) return undefined;
    let cancelled = false;
    loadMaxExpandContentEager().then((module) => {
      if (cancelled) return;
      setLoadedEagerContent(() => module.default);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [performanceModeEnabled, loadedEagerContent]);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(MAXEXPAND_PERFORMANCE_MODE_STORE_KEY).then((value) => {
      if (cancelled) return;
      const enabled = normalizeMaxExpandPerformanceModeEnabled(value);
      cacheMaxExpandPerformanceModeEnabled(enabled);
      setPerformanceModeEnabled(enabled);
      if (!enabled) {
        loadMaxExpandContentEager().then((module) => {
          if (cancelled) return;
          setLoadedEagerContent(() => module.default);
        }).catch(() => {});
      }
    }).catch(() => {});
    const unsubscribe = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${MAXEXPAND_PERFORMANCE_MODE_STORE_KEY}`) {
        const enabled = normalizeMaxExpandPerformanceModeEnabled(value);
        cacheMaxExpandPerformanceModeEnabled(enabled);
        setPerformanceModeEnabled(enabled);
        if (!enabled) {
          loadMaxExpandContentEager().then((module) => {
            if (cancelled) return;
            setLoadedEagerContent(() => module.default);
          }).catch(() => {});
        }
      }
    });
    const handleLocalChange = (event: Event): void => {
      if (cancelled) return;
      const enabled = normalizeMaxExpandPerformanceModeEnabled((event as CustomEvent).detail);
      cacheMaxExpandPerformanceModeEnabled(enabled);
      setPerformanceModeEnabled(enabled);
      if (!enabled) {
        loadMaxExpandContentEager().then((module) => {
          if (cancelled) return;
          setLoadedEagerContent(() => module.default);
        }).catch(() => {});
      }
    };
    window.addEventListener('maxexpand-performance-mode-changed', handleLocalChange);
    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener('maxexpand-performance-mode-changed', handleLocalChange);
    };
  }, []);

  if (performanceModeEnabled) return <MaxExpandContentLazy />;
  if (loadedEagerContent) {
    const LoadedEagerContent = loadedEagerContent;
    return <LoadedEagerContent />;
  }
  return (
    <React.Suspense fallback={<MaxExpandContentShell renderActiveTab={renderEagerLoadingTab} />}>
      <MaxExpandContentEager />
    </React.Suspense>
  );
}
