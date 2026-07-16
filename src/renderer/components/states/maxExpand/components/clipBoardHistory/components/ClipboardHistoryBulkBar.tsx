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
 * @file ClipboardHistoryBulkBar.tsx
 * @description 剪贴板历史批量操作栏：全选、删除已选、时间范围清理。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { ClipboardHistoryBulkBarProps, ClipboardCleanupRange } from '../types/clipboardHistoryTypes';

/**
 * 剪贴板历史批量操作栏
 */
export function ClipboardHistoryBulkBar({
  selectionCollapsing,
  allSelected,
  totalCount,
  selectedCount,
  cleanupRange,
  cleanupMatchedCount,
  onToggleSelectAll,
  onRemoveSelected,
  onCleanupRangeChange,
  onClearByRange,
}: ClipboardHistoryBulkBarProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className={`clipboard-history-bulk-bar${selectionCollapsing ? ' clipboard-history-bulk-bar--collapsing' : ''}`}>
      <label className="clipboard-history-select-all">
        <input
          type="checkbox"
          checked={allSelected}
          disabled={totalCount === 0}
          onChange={onToggleSelectAll}
        />
        <span>{t('clipboardHistoryTab.actions.selectAll', { defaultValue: '全选' })}</span>
      </label>
      <button
        className="clipboard-history-bulk-delete"
        type="button"
        onClick={onRemoveSelected}
        disabled={selectedCount === 0}
      >
        {t('clipboardHistoryTab.actions.deleteSelected', { defaultValue: '删除已选' })}
        {selectedCount > 0 ? ` (${selectedCount})` : ''}
      </button>
      <select
        className="clipboard-history-range-select"
        value={cleanupRange}
        onChange={(e) => onCleanupRangeChange(e.target.value as ClipboardCleanupRange)}
        aria-label={t('clipboardHistoryTab.actions.rangeAria', { defaultValue: '选择清理时间范围' })}
      >
        <option value="lastHour">{t('clipboardHistoryTab.ranges.lastHour', { defaultValue: '最近 1 小时' })}</option>
        <option value="today">{t('clipboardHistoryTab.ranges.today', { defaultValue: '今天' })}</option>
        <option value="last7Days">{t('clipboardHistoryTab.ranges.last7Days', { defaultValue: '最近 7 天' })}</option>
        <option value="last30Days">{t('clipboardHistoryTab.ranges.last30Days', { defaultValue: '最近 30 天' })}</option>
        <option value="olderThan30Days">{t('clipboardHistoryTab.ranges.olderThan30Days', { defaultValue: '30 天前' })}</option>
      </select>
      <button
        className="clipboard-history-range-clear"
        type="button"
        onClick={onClearByRange}
        disabled={cleanupMatchedCount === 0}
      >
        {t('clipboardHistoryTab.actions.clearRange', { defaultValue: '清理范围' })}
        {cleanupMatchedCount > 0 ? ` (${cleanupMatchedCount})` : ''}
      </button>
    </div>
  );
}
