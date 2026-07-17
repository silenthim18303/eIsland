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
 * @file ClipboardHistoryTab.tsx
 * @description 最大展开模式剪贴板历史页主组件：仅负责 hook 调用与组件组合。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useClipboardHistoryFeedback } from '../hooks/useClipboardHistoryFeedback';
import { useClipboardHistoryItems } from '../hooks/useClipboardHistoryItems';
import { useClipboardHistorySelection } from '../hooks/useClipboardHistorySelection';
import { buildClipboardHistoryExport, downloadTextFile, getClipboardHistoryExportFileName } from '../utils/clipboardHistoryUtils';
import { ClipboardHistoryBulkBar } from './ClipboardHistoryBulkBar';
import { ClipboardHistoryHeader } from './ClipboardHistoryHeader';
import { ClipboardHistoryItemRow } from './ClipboardHistoryItemRow';

/**
 * 剪贴板历史页主组件：hook 调用 → 组件组合。
 */
export function ClipboardHistoryTab(): ReactElement {
  const { t } = useTranslation();

  /* ── Hook: 反馈提示 ── */
  const { copyFeedback, showCopyFeedback } = useClipboardHistoryFeedback();

  /* ── Hook: 条目管理 ── */
  const {
    items, setItems, expandedId, setExpandedId,
    editText, setEditText, editTextareaRef, adjustTextareaHeight,
    handleToggleExpand, handleSaveEdit, handleCopy,
  } = useClipboardHistoryItems(showCopyFeedback);

  /* ── Hook: 选择模式 ── */
  const {
    selectedIds, selectionMode, selectionCollapsing, cleanupRange,
    activeFilter, selectedCount, selectedIdSet, visibleItems, allSelected,
    cleanupMatchedCount, handleToggleSelectionMode,
    handleToggleSelect, handleToggleSelectAll,
    handleCleanupRangeChange, handleFilterChange,
    handleRemoveSelected, handleClearByRange,
  } = useClipboardHistorySelection(items, setItems, expandedId, setExpandedId, setEditText);

  const totalCount = items.length;
  const visibleCount = visibleItems.length;

  /* ── 计数标签 ── */
  const countLabel = useMemo(
    () => activeFilter === 'all'
      ? t('clipboardHistoryTab.count', { defaultValue: '{{count}} 条', count: totalCount })
      : t('clipboardHistoryTab.filteredCount', {
        defaultValue: '{{count}} / {{total}} 条',
        count: visibleCount,
        total: totalCount,
      }),
    [activeFilter, t, totalCount, visibleCount],
  );

  /* ── 导出范围 ── */
  const exportItems = useMemo(() => {
    if (!selectionMode || selectedIds.length === 0) return visibleItems;
    return visibleItems.filter((item) => selectedIdSet.has(item.id));
  }, [selectedIdSet, selectedIds.length, selectionMode, visibleItems]);
  const exportCount = exportItems.length;

  /* ── 清空全部 ── */
  const handleClear = (): void => {
    setItems([]);
    setExpandedId(null);
    setEditText('');
  };

  /* ── 删除单条 ── */
  const handleRemove = (id: number): void => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (expandedId === id) {
      setExpandedId(null);
      setEditText('');
    }
  };

  /* ── 导出 ── */
  const handleExport = (): void => {
    if (exportItems.length === 0) return;
    try {
      const now = new Date();
      downloadTextFile(
        getClipboardHistoryExportFileName(now),
        buildClipboardHistoryExport(exportItems, now),
      );
      showCopyFeedback('success', t('clipboardHistoryTab.messages.exportSuccess', {
        defaultValue: '已导出 {{count}} 条剪贴板记录',
        count: exportItems.length,
      }));
    } catch {
      showCopyFeedback('error', t('clipboardHistoryTab.messages.exportFailed', { defaultValue: '导出失败，请稍后重试' }));
    }
  };

  return (
    <div className="clipboard-history">
      <ClipboardHistoryHeader
        totalCount={totalCount}
        visibleCount={visibleCount}
        activeFilter={activeFilter}
        exportCount={exportCount}
        selectionMode={selectionMode}
        selectedCount={selectedCount}
        countLabel={countLabel}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
        onExport={handleExport}
        onToggleSelectionMode={handleToggleSelectionMode}
      />

      {selectionMode ? (
        <ClipboardHistoryBulkBar
          selectionCollapsing={selectionCollapsing}
          allSelected={allSelected}
          totalCount={totalCount}
          selectedCount={selectedCount}
          cleanupRange={cleanupRange}
          cleanupMatchedCount={cleanupMatchedCount}
          onToggleSelectAll={handleToggleSelectAll}
          onRemoveSelected={handleRemoveSelected}
          onCleanupRangeChange={handleCleanupRangeChange}
          onClearByRange={handleClearByRange}
        />
      ) : null}

      {copyFeedback ? (
        <div className={`clipboard-history-feedback clipboard-history-feedback--${copyFeedback.type}`} role="status" aria-live="polite">
          {copyFeedback.text}
        </div>
      ) : null}

      <div
        className="clipboard-history-list"
        onWheelCapture={(e) => {
          e.stopPropagation();
        }}
      >
        {items.length === 0 ? (
          <div className="clipboard-history-empty">
            {t('clipboardHistoryTab.empty', { defaultValue: '暂时没有记录，复制一些文本后会显示在这里。' })}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="clipboard-history-empty">
            {t('clipboardHistoryTab.emptyFiltered', { defaultValue: '当前类型下没有记录。' })}
          </div>
        ) : visibleItems.map((item) => (
          <ClipboardHistoryItemRow
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            selected={selectedIdSet.has(item.id)}
            selectionMode={selectionMode}
            selectionCollapsing={selectionCollapsing}
            editText={editText}
            editTextareaRef={editTextareaRef}
            onToggleSelect={handleToggleSelect}
            onCopy={handleCopy}
            onToggleExpand={handleToggleExpand}
            onEditTextChange={setEditText}
            onEditTextareaRef={adjustTextareaHeight}
            onSaveEdit={handleSaveEdit}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}
