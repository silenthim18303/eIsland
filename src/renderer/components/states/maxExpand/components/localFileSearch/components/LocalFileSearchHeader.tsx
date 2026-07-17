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
 * @file LocalFileSearchHeader.tsx
 * @description 本地文件搜索标题栏组件。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { LocalFileSearchHeaderProps } from '../types/localFileSearchTypes';

/**
 * 本地文件搜索标题栏
 * @description 显示标题和结果数量
 */
export function LocalFileSearchHeader({ countText }: LocalFileSearchHeaderProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="local-file-search-header">
      <span className="local-file-search-title">{t('maxExpand.localFileSearch.title', { defaultValue: '本地文件查找' })}</span>
      <span className="local-file-search-count">{countText}</span>
    </div>
  );
}
