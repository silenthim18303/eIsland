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
 * @file localFileSearchTypes.ts
 * @description 本地文件搜索模块类型定义。
 * @author 鸡哥
 */

/** 匹配方式 */
export type MatchMode = 'contains' | 'startsWith' | 'endsWith' | 'exact';

/** 匹配范围 */
export type MatchScope = 'name' | 'path';

/** 文件搜索结果条目 */
export interface LocalFileSearchItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

/** useLocalFileSearch hook 返回值类型 */
export interface UseLocalFileSearchReturn {
  rootDir: string;
  setRootDir: React.Dispatch<React.SetStateAction<string>>;
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
  showConfig: boolean;
  setShowConfig: React.Dispatch<React.SetStateAction<boolean>>;
  resultLimit: number;
  setResultLimit: React.Dispatch<React.SetStateAction<number>>;
  maxDepth: number;
  setMaxDepth: React.Dispatch<React.SetStateAction<number>>;
  caseSensitive: boolean;
  setCaseSensitive: React.Dispatch<React.SetStateAction<boolean>>;
  matchMode: MatchMode;
  setMatchMode: React.Dispatch<React.SetStateAction<MatchMode>>;
  matchScope: MatchScope;
  setMatchScope: React.Dispatch<React.SetStateAction<MatchScope>>;
  includeFiles: boolean;
  setIncludeFiles: React.Dispatch<React.SetStateAction<boolean>>;
  includeHidden: boolean;
  setIncludeHidden: React.Dispatch<React.SetStateAction<boolean>>;
  extensionsInput: string;
  setExtensionsInput: React.Dispatch<React.SetStateAction<string>>;
  excludeDirsInput: string;
  setExcludeDirsInput: React.Dispatch<React.SetStateAction<string>>;
  includeDirectories: boolean;
  setIncludeDirectories: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  results: LocalFileSearchItem[];
  iconMap: Record<string, string>;
  countText: string;
  handlePickRootDir: () => void;
  handleSearch: () => void;
}

/** LocalFileSearchHeader 组件入参 */
export interface LocalFileSearchHeaderProps {
  countText: string;
}

/** LocalFileSearchRootRow 组件入参 */
export interface LocalFileSearchRootRowProps {
  rootDir: string;
  setRootDir: React.Dispatch<React.SetStateAction<string>>;
  onPickRootDir: () => void;
}

/** LocalFileSearchQueryRow 组件入参 */
export interface LocalFileSearchQueryRowProps {
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  showConfig: boolean;
  setShowConfig: React.Dispatch<React.SetStateAction<boolean>>;
  onSearch: () => void;
}

/** LocalFileSearchConfigPanel 组件入参 */
export interface LocalFileSearchConfigPanelProps {
  resultLimit: number;
  setResultLimit: React.Dispatch<React.SetStateAction<number>>;
  matchScope: MatchScope;
  setMatchScope: React.Dispatch<React.SetStateAction<MatchScope>>;
  matchMode: MatchMode;
  setMatchMode: React.Dispatch<React.SetStateAction<MatchMode>>;
  maxDepth: number;
  setMaxDepth: React.Dispatch<React.SetStateAction<number>>;
  extensionsInput: string;
  setExtensionsInput: React.Dispatch<React.SetStateAction<string>>;
  excludeDirsInput: string;
  setExcludeDirsInput: React.Dispatch<React.SetStateAction<string>>;
  includeDirectories: boolean;
  setIncludeDirectories: React.Dispatch<React.SetStateAction<boolean>>;
  includeFiles: boolean;
  setIncludeFiles: React.Dispatch<React.SetStateAction<boolean>>;
  includeHidden: boolean;
  setIncludeHidden: React.Dispatch<React.SetStateAction<boolean>>;
  caseSensitive: boolean;
  setCaseSensitive: React.Dispatch<React.SetStateAction<boolean>>;
}

/** LocalFileSearchResults 组件入参 */
export interface LocalFileSearchResultsProps {
  loading: boolean;
  results: LocalFileSearchItem[];
  iconMap: Record<string, string>;
}
