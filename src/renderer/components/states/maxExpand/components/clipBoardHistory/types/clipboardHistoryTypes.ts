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
 * @file clipboardHistoryTypes.ts
 * @description 剪贴板历史模块类型定义。
 * @author 鸡哥
 */

/** 剪贴板历史条目 */
export interface ClipboardHistoryItem {
  id: number;
  text: string;
  createdAt: number;
}

/** 清理时间范围 */
export type ClipboardCleanupRange = 'lastHour' | 'today' | 'last7Days' | 'last30Days' | 'olderThan30Days';

/** 筛选类型 */
export type ClipboardHistoryFilter = 'all' | 'url' | 'text';

/** 筛选选项列表 */
export const CLIPBOARD_HISTORY_FILTERS: ClipboardHistoryFilter[] = ['all', 'url', 'text'];

/** 筛选选项翻译键 */
export const CLIPBOARD_HISTORY_FILTER_LABEL_KEYS: Record<ClipboardHistoryFilter, string> = {
  all: 'clipboardHistoryTab.filters.all',
  url: 'clipboardHistoryTab.filters.url',
  text: 'clipboardHistoryTab.filters.text',
};

/** 筛选选项默认标签 */
export const CLIPBOARD_HISTORY_FILTER_DEFAULT_LABELS: Record<ClipboardHistoryFilter, string> = {
  all: 'All',
  url: 'URL',
  text: 'Text',
};

/** ClipboardHistoryHeader 组件入参 */
export interface ClipboardHistoryHeaderProps {
  totalCount: number;
  visibleCount: number;
  activeFilter: ClipboardHistoryFilter;
  exportCount: number;
  selectionMode: boolean;
  selectedCount: number;
  countLabel: string;
  onFilterChange: (filter: ClipboardHistoryFilter) => void;
  onClear: () => void;
  onExport: () => void;
  onToggleSelectionMode: () => void;
}

/** ClipboardHistoryBulkBar 组件入参 */
export interface ClipboardHistoryBulkBarProps {
  selectionCollapsing: boolean;
  allSelected: boolean;
  totalCount: number;
  selectedCount: number;
  cleanupRange: ClipboardCleanupRange;
  cleanupMatchedCount: number;
  onToggleSelectAll: () => void;
  onRemoveSelected: () => void;
  onCleanupRangeChange: (range: ClipboardCleanupRange) => void;
  onClearByRange: () => void;
}

/** ClipboardHistoryItemRow 组件入参 */
export interface ClipboardHistoryItemRowProps {
  item: ClipboardHistoryItem;
  expanded: boolean;
  selected: boolean;
  selectionMode: boolean;
  selectionCollapsing: boolean;
  editText: string;
  editTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onToggleSelect: (id: number) => void;
  onCopy: (item: ClipboardHistoryItem) => void;
  onToggleExpand: (item: ClipboardHistoryItem) => void;
  onEditTextChange: (text: string) => void;
  onEditTextareaRef: (el: HTMLTextAreaElement | null) => void;
  onSaveEdit: (id: number) => void;
  onRemove: (id: number) => void;
}

/** useClipboardHistoryItems 返回值类型 */
export interface UseClipboardHistoryItemsReturn {
  items: ClipboardHistoryItem[];
  setItems: React.Dispatch<React.SetStateAction<ClipboardHistoryItem[]>>;
  historyLimit: number;
  loaded: boolean;
  expandedId: number | null;
  setExpandedId: React.Dispatch<React.SetStateAction<number | null>>;
  editText: string;
  setEditText: React.Dispatch<React.SetStateAction<string>>;
  editTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  adjustTextareaHeight: (el: HTMLTextAreaElement | null) => void;
  handleToggleExpand: (item: ClipboardHistoryItem) => void;
  handleSaveEdit: (id: number) => void;
  handleCopy: (item: ClipboardHistoryItem) => void;
}

/** useClipboardHistorySelection 返回值类型 */
export interface UseClipboardHistorySelectionReturn {
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  selectionMode: boolean;
  setSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectionCollapsing: boolean;
  setSelectionCollapsing: React.Dispatch<React.SetStateAction<boolean>>;
  cleanupRange: ClipboardCleanupRange;
  activeFilter: ClipboardHistoryFilter;
  setActiveFilter: React.Dispatch<React.SetStateAction<ClipboardHistoryFilter>>;
  selectedCount: number;
  selectedIdSet: Set<number>;
  visibleItems: ClipboardHistoryItem[];
  visibleIdSet: Set<number>;
  allSelected: boolean;
  cleanupMatchedIdSet: Set<number>;
  cleanupMatchedCount: number;
  handleToggleSelectionMode: () => void;
  handleToggleSelect: (id: number) => void;
  handleToggleSelectAll: () => void;
  handleCleanupRangeChange: (range: ClipboardCleanupRange) => void;
  handleFilterChange: (filter: ClipboardHistoryFilter) => void;
  handleRemoveSelected: () => void;
  handleClearByRange: () => void;
}

/** useClipboardHistoryFeedback 返回值类型 */
export interface UseClipboardHistoryFeedbackReturn {
  copyFeedback: { type: 'success' | 'error'; text: string } | null;
  showCopyFeedback: (type: 'success' | 'error', text: string) => void;
}
