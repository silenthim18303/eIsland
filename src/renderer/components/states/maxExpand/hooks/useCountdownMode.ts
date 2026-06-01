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
 * @file useCountdownMode.ts
 * @description 倒数日窗口模式解析 Hook
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import type { MaxExpandTab } from '../../../../store/types';
import { STANDALONE_HIDDEN_TABS, getStartupMode, getStartupModeReady, isStartupModeResolved } from '../config/shellConstants';

/**
 * 解析并维护倒数日窗口模式（集成 / 独立）。
 * @param setActiveTab - 设置当前 Tab 的回调。
 * @returns 当前窗口模式。
 */
export function useCountdownMode(
  setActiveTab: (tab: MaxExpandTab) => void,
): 'integrated' | 'standalone' {
  const [countdownMode, setCountdownMode] = useState<'integrated' | 'standalone'>(
    isStartupModeResolved() ? getStartupMode() : 'integrated'
  );

  useEffect(() => {
    let cancelled = false;
    getStartupModeReady().then(() => {
      if (cancelled) return;
      setCountdownMode(getStartupMode());
      if (getStartupMode() === 'standalone' && STANDALONE_HIDDEN_TABS.has(activeTabRef.current)) {
        setActiveTab('aiChat');
      }
    });
    return () => { cancelled = true; };
  }, [setActiveTab]);

  return countdownMode;
}

/** 模块级 ref，用于在异步回调中读取当前 activeTab */
const activeTabRef: { current: MaxExpandTab } = { current: 'aiChat' };

/**
 * 更新 activeTabRef（由组件调用）。
 * @param tab - 当前 Tab。
 */
export function updateActiveTabRef(tab: MaxExpandTab): void {
  activeTabRef.current = tab;
}
