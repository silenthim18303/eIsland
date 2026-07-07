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
 * @file useLanguageSelect.ts
 * @description 引导语言选择步骤 — 语言选择逻辑 Hook
 * @author 鸡哥
 */

import { useState, useCallback } from 'react';
import { getLanguage, setLanguage, type AppLanguage } from '../../../../../i18n';

interface UseLanguageSelectReturn {
  /** 当前选中的语言 */
  selected: AppLanguage;
  /** 选择语言（立即切换） */
  handleSelect: (lang: AppLanguage) => void;
}

/**
 * 语言选择逻辑 Hook
 * @description 管理选中状态，选择时自动切换应用语言
 */
export function useLanguageSelect(): UseLanguageSelectReturn {
  const [selected, setSelected] = useState<AppLanguage>(getLanguage);

  const handleSelect = useCallback((lang: AppLanguage): void => {
    setSelected(lang);
    setLanguage(lang).catch(() => {});
    window.api.settingsPreview('i18n:language', lang).catch(() => {});
  }, []);

  return { selected, handleSelect };
}
