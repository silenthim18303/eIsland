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
 * @file renderEagerLoadingTab.tsx
 * @description Eager 模式加载中的 Tab 渲染函数
 * @author 鸡哥
 */

import type React from 'react';

/**
 * 渲染 eager 模式加载中的 fallback。
 * @param _activeTab - 当前 Tab（未使用）。
 * @param loadingFallback - 加载中 fallback 元素。
 * @returns fallback 元素。
 */
export function renderEagerLoadingTab(
  _activeTab: unknown,
  loadingFallback: React.ReactElement,
): React.ReactElement {
  return loadingFallback;
}
