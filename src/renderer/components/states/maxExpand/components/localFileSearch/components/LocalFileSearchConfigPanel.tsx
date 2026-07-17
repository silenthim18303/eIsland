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
 * @file LocalFileSearchConfigPanel.tsx
 * @description 搜索配置面板组件。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { LocalFileSearchConfigPanelProps } from '../types/localFileSearchTypes';

/**
 * 搜索配置面板
 * @description 配置搜索参数：结果数、匹配范围、匹配方式、深度、后缀、排除目录等
 */
export function LocalFileSearchConfigPanel({
  resultLimit, setResultLimit,
  matchScope, setMatchScope,
  matchMode, setMatchMode,
  maxDepth, setMaxDepth,
  extensionsInput, setExtensionsInput,
  excludeDirsInput, setExcludeDirsInput,
  includeDirectories, setIncludeDirectories,
  includeFiles, setIncludeFiles,
  includeHidden, setIncludeHidden,
  caseSensitive, setCaseSensitive,
}: LocalFileSearchConfigPanelProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="local-file-search-config-panel">
      <label className="local-file-search-config-item">
        <span className="local-file-search-config-label">
          {t('maxExpand.localFileSearch.limitLabel', { defaultValue: '最大结果数' })}
        </span>
        <select
          className="local-file-search-config-select"
          value={String(resultLimit)}
          onChange={(e) => {
            const nextLimit = Number(e.target.value);
            if (Number.isFinite(nextLimit) && nextLimit > 0) {
              setResultLimit(nextLimit);
            }
          }}
        >
          <option value="50">50</option>
          <option value="120">120</option>
          <option value="300">300</option>
        </select>
      </label>

      <label className="local-file-search-config-item">
        <span className="local-file-search-config-label">
          {t('maxExpand.localFileSearch.matchScopeLabel', { defaultValue: '匹配范围' })}
        </span>
        <select
          className="local-file-search-config-select"
          value={matchScope}
          onChange={(e) => {
            const nextValue = e.target.value;
            if (nextValue === 'name' || nextValue === 'path') {
              setMatchScope(nextValue);
            }
          }}
        >
          <option value="name">{t('maxExpand.localFileSearch.matchScopeName', { defaultValue: '文件名' })}</option>
          <option value="path">{t('maxExpand.localFileSearch.matchScopePath', { defaultValue: '完整路径' })}</option>
        </select>
      </label>

      <label className="local-file-search-config-item">
        <span className="local-file-search-config-label">
          {t('maxExpand.localFileSearch.matchModeLabel', { defaultValue: '匹配方式' })}
        </span>
        <select
          className="local-file-search-config-select"
          value={matchMode}
          onChange={(e) => {
            const nextValue = e.target.value;
            if (nextValue === 'contains' || nextValue === 'startsWith' || nextValue === 'endsWith' || nextValue === 'exact') {
              setMatchMode(nextValue);
            }
          }}
        >
          <option value="contains">{t('maxExpand.localFileSearch.matchModeContains', { defaultValue: '包含' })}</option>
          <option value="startsWith">{t('maxExpand.localFileSearch.matchModeStartsWith', { defaultValue: '前缀' })}</option>
          <option value="endsWith">{t('maxExpand.localFileSearch.matchModeEndsWith', { defaultValue: '后缀' })}</option>
          <option value="exact">{t('maxExpand.localFileSearch.matchModeExact', { defaultValue: '精确匹配' })}</option>
        </select>
      </label>

      <label className="local-file-search-config-item">
        <span className="local-file-search-config-label">
          {t('maxExpand.localFileSearch.depthLabel', { defaultValue: '最大深度' })}
        </span>
        <select
          className="local-file-search-config-select"
          value={String(maxDepth)}
          onChange={(e) => {
            const nextDepth = Number(e.target.value);
            if (Number.isFinite(nextDepth) && nextDepth >= 0) {
              setMaxDepth(nextDepth);
            }
          }}
        >
          <option value="2">2</option>
          <option value="4">4</option>
          <option value="8">8</option>
          <option value="12">12</option>
        </select>
      </label>

      <label className="local-file-search-config-item local-file-search-config-item--input">
        <span className="local-file-search-config-label">
          {t('maxExpand.localFileSearch.extensionsLabel', { defaultValue: '文件后缀' })}
        </span>
        <input
          className="local-file-search-config-input"
          value={extensionsInput}
          onChange={(e) => setExtensionsInput(e.target.value)}
          placeholder={t('maxExpand.localFileSearch.extensionsPlaceholder', { defaultValue: '如 pdf,docx,ts' })}
        />
      </label>

      <label className="local-file-search-config-item local-file-search-config-item--input">
        <span className="local-file-search-config-label">
          {t('maxExpand.localFileSearch.excludeDirsLabel', { defaultValue: '排除目录' })}
        </span>
        <input
          className="local-file-search-config-input"
          value={excludeDirsInput}
          onChange={(e) => setExcludeDirsInput(e.target.value)}
          placeholder={t('maxExpand.localFileSearch.excludeDirsPlaceholder', { defaultValue: '如 dist,build,coverage' })}
        />
      </label>

      <label className="local-file-search-config-item local-file-search-config-item--checkbox">
        <input
          type="checkbox"
          checked={includeDirectories}
          onChange={(e) => setIncludeDirectories(e.target.checked)}
        />
        <span className="local-file-search-config-label">
          {t('maxExpand.localFileSearch.includeFolders', { defaultValue: '结果包含文件夹' })}
        </span>
      </label>

      <label className="local-file-search-config-item local-file-search-config-item--checkbox">
        <input
          type="checkbox"
          checked={includeFiles}
          onChange={(e) => setIncludeFiles(e.target.checked)}
        />
        <span className="local-file-search-config-label">
          {t('maxExpand.localFileSearch.includeFiles', { defaultValue: '结果包含文件' })}
        </span>
      </label>

      <label className="local-file-search-config-item local-file-search-config-item--checkbox">
        <input
          type="checkbox"
          checked={includeHidden}
          onChange={(e) => setIncludeHidden(e.target.checked)}
        />
        <span className="local-file-search-config-label">
          {t('maxExpand.localFileSearch.includeHidden', { defaultValue: '包含隐藏项' })}
        </span>
      </label>

      <label className="local-file-search-config-item local-file-search-config-item--checkbox">
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={(e) => setCaseSensitive(e.target.checked)}
        />
        <span className="local-file-search-config-label">
          {t('maxExpand.localFileSearch.caseSensitive', { defaultValue: '区分大小写' })}
        </span>
      </label>
    </div>
  );
}
