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

/** 语言选项条目 */
export interface LanguageOption {
  value: string;
  labelKey: string;
  icon: string;
  available: boolean;
}

/** 全部语言选项（含未来待支持语言） */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'zh-CN', labelKey: 'guide.language.zhCN', icon: '/svg/countries/CHN.svg', available: true },
  { value: 'en-US', labelKey: 'guide.language.enUS', icon: '/svg/countries/USA.svg', available: true },
  { value: 'ja-JP', labelKey: 'guide.language.jaJP', icon: '/svg/countries/JP.svg', available: false },
  { value: 'ko-KR', labelKey: 'guide.language.koKR', icon: '/svg/countries/KR.svg', available: false },
  { value: 'fr-FR', labelKey: 'guide.language.frFR', icon: '/svg/countries/FR.svg', available: false },
  { value: 'de-DE', labelKey: 'guide.language.deDE', icon: '/svg/countries/DE.svg', available: false },
  { value: 'es-ES', labelKey: 'guide.language.esES', icon: '/svg/countries/ES.svg', available: false },
  { value: 'ru-RU', labelKey: 'guide.language.ruRU', icon: '/svg/countries/RU.svg', available: false },
];
