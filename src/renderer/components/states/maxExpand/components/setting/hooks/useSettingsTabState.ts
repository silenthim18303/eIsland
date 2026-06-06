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
 * @file useSettingsTabState.ts
 * @description 设置页基础状态 Hooks，包含侧栏页签记忆与登录会话同步
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import { readLocalToken, subscribeUserAccountSessionChanged } from '../../../../../../utils/userAccount';
import { SETTINGS_SIDEBAR_DEFAULT_TAB } from '../config/settingsTabConfig';
import type { SettingsSidebarTabKey } from '../utils/settingsConfig';

/**
 * 管理设置侧栏当前页签；每次进入设置默认停留在「快速导航」页。
 * @returns 当前页签与页签更新函数
 */
export function useSettingsSidebarTabState() {
  const [activeTab, setActiveTab] = useState<SettingsSidebarTabKey>(SETTINGS_SIDEBAR_DEFAULT_TAB);

  return [activeTab, setActiveTab] as const;
}

/**
 * 监听并同步用户登录会话状态。
 * @returns 当前会话 Token 与是否已登录标记
 */
export function useUserSessionState() {
  const [sessionToken, setSessionToken] = useState<string | null>(() => readLocalToken());
  const [hasLoginSession, setHasLoginSession] = useState<boolean>(() => Boolean(readLocalToken()));

  useEffect(() => {
    const applySession = (): void => {
      const token = readLocalToken();
      setSessionToken(token);
      setHasLoginSession(Boolean(token));
    };

    applySession();
    return subscribeUserAccountSessionChanged(applySession);
  }, []);

  return { sessionToken, hasLoginSession };
}
