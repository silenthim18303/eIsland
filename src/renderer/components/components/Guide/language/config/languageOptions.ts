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
 * @file languageOptions.ts
 * @description 引导语言选择步骤 — 语言选项配置
 * @author 鸡哥
 */

import type { AppLanguage } from '../../../../../i18n';

/** 语言选项 */
export const LANGUAGE_OPTIONS: { value: AppLanguage; labelKey: string }[] = [
  { value: 'zh-CN', labelKey: 'guide.language.zhCN' },
  { value: 'en-US', labelKey: 'guide.language.enUS' },
];
