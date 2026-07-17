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
 * @file LocalFileSearchRootRow.tsx
 * @description 搜索根目录选择行组件。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { LocalFileSearchRootRowProps } from '../types/localFileSearchTypes';

/**
 * 搜索根目录选择行
 * @description 输入或选择搜索根目录
 */
export function LocalFileSearchRootRow({ rootDir, setRootDir, onPickRootDir }: LocalFileSearchRootRowProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="local-file-search-root-row">
      <input
        className="local-file-search-root-input"
        value={rootDir}
        onChange={(e) => setRootDir(e.target.value)}
        placeholder={t('maxExpand.localFileSearch.rootPlaceholder', { defaultValue: '选择或输入搜索目录，例如 C:\\Users' })}
      />
      <button type="button" className="local-file-search-btn" onClick={onPickRootDir}>
        {t('maxExpand.localFileSearch.pickDir', { defaultValue: '选择目录' })}
      </button>
    </div>
  );
}
