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

import React from 'react';
import { readCachedMaxExpandPerformanceModeEnabled } from './components/setting/utils/performanceSettings';
import { usePerformanceMode } from './hooks/usePerformanceMode';
import { useEagerContentLoader } from './hooks/useEagerContentLoader';
import { renderEagerLoadingTab } from './utils/renderEagerLoadingTab';
import { MaxExpandContentLazy } from './MaxExpandContentLazy';
import { MaxExpandContentShell } from './MaxExpandContentShell';
import { loadMaxExpandContentEager, preloadMaxExpandContentEager } from './maxExpandContentEagerLoader';

const MaxExpandContentEager = React.lazy(loadMaxExpandContentEager);
if (!readCachedMaxExpandPerformanceModeEnabled()) {
  preloadMaxExpandContentEager();
}

/**
 * 最大展开模式内容组件
 * @description 渲染最大展开态的 Tab 内容与底部导航点
 */
export function MaxExpandContent(): React.ReactElement {
  const performanceModeEnabled = usePerformanceMode();
  const loadedEagerContent = useEagerContentLoader(performanceModeEnabled);

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
