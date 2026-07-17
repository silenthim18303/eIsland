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
 * @file LocalFileSearchResults.tsx
 * @description 搜索结果列表组件。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { LocalFileSearchResultsProps } from '../types/localFileSearchTypes';

/**
 * 搜索结果列表
 * @description 显示加载中、空状态或搜索结果列表
 */
export function LocalFileSearchResults({ loading, results, iconMap }: LocalFileSearchResultsProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="local-file-search-results">
      {loading ? (
        <div className="local-file-search-empty">{t('maxExpand.localFileSearch.loading', { defaultValue: '正在检索本地文件…' })}</div>
      ) : results.length === 0 ? (
        <div className="local-file-search-empty">{t('maxExpand.localFileSearch.empty', { defaultValue: '暂无结果，试试更换关键词或目录。' })}</div>
      ) : (
        results.map((item) => (
          <button
            key={item.path}
            type="button"
            className="local-file-search-item"
            onDoubleClick={() => {
              void window.api.openFile(item.path);
            }}
            title={item.path}
          >
            <span className="local-file-search-item-icon-wrap">
              {item.isDirectory ? (
                <span className="local-file-search-item-icon-placeholder">📁</span>
              ) : iconMap[item.path] ? (
                <img
                  className="local-file-search-item-icon"
                  src={`data:image/png;base64,${iconMap[item.path]}`}
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <span className="local-file-search-item-icon-placeholder">📄</span>
              )}
            </span>
            <span className="local-file-search-item-main">
              <span className="local-file-search-item-name">{item.name}</span>
              <span className="local-file-search-item-path">{item.path}</span>
            </span>
          </button>
        ))
      )}
    </div>
  );
}
