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
 * @file shellConstants.ts
 * @description MaxExpandContentShell 常量与启动模式解析
 * @author 鸡哥
 */

import type { MaxExpandTab } from '../../../../store/types';

export type NavDotId = MaxExpandTab | 'expanded';

/** 独立窗口模式下隐藏的 Tab 集合 */
export const STANDALONE_HIDDEN_TABS: Set<NavDotId> = new Set([
  'todo', 'countdown', 'urlFavorites', 'album', 'mail',
  'localFileSearch', 'clipboardHistory', 'memo', 'alarm', 'toolbox', 'settings',
]);

/** 当前启动模式（集成 / 独立） */
let _startupMode: 'integrated' | 'standalone' = 'integrated';
let _startupModeResolved = false;

/** 启动模式解析完成的 Promise */
const _startupModeReady: Promise<void> = (window.api?.storeRead?.('standalone-window-mode') ?? Promise.resolve(null))
  .then((data: unknown) => {
    if (data === 'standalone') {
      _startupMode = 'standalone';
      return;
    }
    return window.api?.storeRead?.('countdown-window-mode').then((legacyMode: unknown) => {
      if (legacyMode === 'standalone') _startupMode = 'standalone';
    }).catch(() => {});
  })
  .catch(() => {})
  .finally(() => { _startupModeResolved = true; });

/**
 * 获取当前启动模式。
 * @returns 启动模式。
 */
export function getStartupMode(): 'integrated' | 'standalone' {
  return _startupMode;
}

/**
 * 启动模式是否已解析完成。
 * @returns 是否已解析。
 */
export function isStartupModeResolved(): boolean {
  return _startupModeResolved;
}

/**
 * 等待启动模式解析完成的 Promise。
 * @returns Promise。
 */
export function getStartupModeReady(): Promise<void> {
  return _startupModeReady;
}
