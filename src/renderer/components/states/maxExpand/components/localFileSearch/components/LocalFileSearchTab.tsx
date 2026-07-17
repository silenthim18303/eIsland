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
 * @file LocalFileSearchTab.tsx
 * @description 最大展开模式本地文件查找页 — 仅负责 hook 调用与组件组合。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useLocalFileSearch } from '../hooks/useLocalFileSearch';
import { LocalFileSearchConfigPanel } from './LocalFileSearchConfigPanel';
import { LocalFileSearchHeader } from './LocalFileSearchHeader';
import { LocalFileSearchQueryRow } from './LocalFileSearchQueryRow';
import { LocalFileSearchResults } from './LocalFileSearchResults';
import { LocalFileSearchRootRow } from './LocalFileSearchRootRow';

/**
 * 本地文件搜索页
 * @description 最大展开模式下的本地文件检索页面：hook 调用 → 组件组合
 */
export function LocalFileSearchTab(): ReactElement {
  const {
    rootDir, setRootDir,
    keyword, setKeyword,
    showConfig, setShowConfig,
    resultLimit, setResultLimit,
    maxDepth, setMaxDepth,
    caseSensitive, setCaseSensitive,
    matchMode, setMatchMode,
    matchScope, setMatchScope,
    includeFiles, setIncludeFiles,
    includeHidden, setIncludeHidden,
    extensionsInput, setExtensionsInput,
    excludeDirsInput, setExcludeDirsInput,
    includeDirectories, setIncludeDirectories,
    loading, results, iconMap, countText,
    handlePickRootDir, handleSearch,
  } = useLocalFileSearch();

  return (
    <div className="local-file-search">
      <LocalFileSearchHeader countText={countText} />

      <LocalFileSearchRootRow
        rootDir={rootDir}
        setRootDir={setRootDir}
        onPickRootDir={handlePickRootDir}
      />

      <LocalFileSearchQueryRow
        keyword={keyword}
        setKeyword={setKeyword}
        loading={loading}
        showConfig={showConfig}
        setShowConfig={setShowConfig}
        onSearch={handleSearch}
      />

      {showConfig ? (
        <LocalFileSearchConfigPanel
          resultLimit={resultLimit}
          setResultLimit={setResultLimit}
          matchScope={matchScope}
          setMatchScope={setMatchScope}
          matchMode={matchMode}
          setMatchMode={setMatchMode}
          maxDepth={maxDepth}
          setMaxDepth={setMaxDepth}
          extensionsInput={extensionsInput}
          setExtensionsInput={setExtensionsInput}
          excludeDirsInput={excludeDirsInput}
          setExcludeDirsInput={setExcludeDirsInput}
          includeDirectories={includeDirectories}
          setIncludeDirectories={setIncludeDirectories}
          includeFiles={includeFiles}
          setIncludeFiles={setIncludeFiles}
          includeHidden={includeHidden}
          setIncludeHidden={setIncludeHidden}
          caseSensitive={caseSensitive}
          setCaseSensitive={setCaseSensitive}
        />
      ) : null}

      {loading ? (
        <div className="local-file-search-progress" aria-hidden="true">
          <span className="local-file-search-progress-bar" />
        </div>
      ) : null}

      <LocalFileSearchResults
        loading={loading}
        results={results}
        iconMap={iconMap}
      />
    </div>
  );
}
