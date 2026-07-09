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
 * @file useThemeSetting.ts
 * @description 引导外观设置逻辑 Hook
 * @author 鸡哥
 */

import { useState, useCallback, useEffect } from 'react';
import type { ThemeMode } from '../../../../../utils/theme';
import { setThemeMode } from '../../../../../utils/theme';
import { OPACITY_DEFAULT } from '../config/themeOptions';

interface UseThemeSettingReturn {
  /** 当前主题模式 */
  mode: ThemeMode;
  /** 当前透明度 */
  opacity: number;
  /** 切换主题模式 */
  setMode: (mode: ThemeMode) => void;
  /** 设置透明度 */
  setOpacity: (value: number) => void;
}

/**
 * 主题设置逻辑 Hook
 * @description 从存储加载主题模式和透明度，管理状态并实时同步
 */
export function useThemeSetting(): UseThemeSettingReturn {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [opacity, setOpacityState] = useState<number>(OPACITY_DEFAULT);

  /** 初始化时从存储加载 */
  useEffect(() => {
    Promise.all([
      window.api.themeModeGet(),
      window.api.islandOpacityGet(),
    ]).then(([themeMode, op]) => {
      const safe: ThemeMode =
        themeMode === 'dark' || themeMode === 'light' || themeMode === 'system'
          ? themeMode
          : 'dark';
      setModeState(safe);
      setOpacityState(typeof op === 'number' ? op : OPACITY_DEFAULT);
    }).catch(() => {});
  }, []);

  const setMode = useCallback((newMode: ThemeMode): void => {
    setModeState(newMode);
    setThemeMode(newMode).catch(() => {});
  }, []);

  const setOpacity = useCallback((value: number): void => {
    const safe = Math.max(10, Math.min(100, Math.round(value)));
    setOpacityState(safe);
    window.api.islandOpacitySet(safe).catch(() => {});
  }, []);

  return { mode, opacity, setMode, setOpacity };
}
