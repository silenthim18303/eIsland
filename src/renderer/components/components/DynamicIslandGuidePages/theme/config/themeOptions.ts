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

import type { ThemeMode } from '../../../../../utils/theme';
import { SvgIcon } from '../../../../../utils/SvgIcon';

/** 主题模式选项条目 */
export interface ThemeModeOption {
  /** 模式值 */
  value: ThemeMode;
  /** 显示名称 i18n key */
  labelKey: string;
  /** 图标路径 */
  icon: string;
}

/** 主题模式选项列表 */
export const THEME_MODE_OPTIONS: ThemeModeOption[] = [
  { value: 'dark', labelKey: 'guide.theme.dark', icon: SvgIcon.THEME_DARK },
  { value: 'light', labelKey: 'guide.theme.light', icon: SvgIcon.THEME_LIGHT },
  { value: 'system', labelKey: 'guide.theme.system', icon: SvgIcon.THEME_FOLLOW_SYSTEM },
];

/** 透明度最小值 */
export const OPACITY_MIN = 10;

/** 透明度最大值 */
export const OPACITY_MAX = 100;

/** 透明度默认值 */
export const OPACITY_DEFAULT = 100;
