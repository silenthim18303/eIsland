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
 * @file ClipboardHistoryHeader.tsx
 * @description 剪贴板历史头部栏：标题、计数、筛选、操作按钮。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { ClipboardHistoryHeaderProps } from '../types/clipboardHistoryTypes';
import { CLIPBOARD_HISTORY_FILTER_DEFAULT_LABELS, CLIPBOARD_HISTORY_FILTER_LABEL_KEYS, CLIPBOARD_HISTORY_FILTERS } from '../types/clipboardHistoryTypes';

/**
 * 剪贴板历史头部栏
 */
export function ClipboardHistoryHeader({
  totalCount,
  activeFilter,
  exportCount,
  selectionMode,
  selectedCount,
  countLabel,
  onFilterChange,
  onClear,
  onExport,
  onToggleSelectionMode,
}: ClipboardHistoryHeaderProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="clipboard-history-header">
      <span className="clipboard-history-title">{t('clipboardHistoryTab.title', { defaultValue: '剪贴板历史' })}</span>
      <div className="clipboard-history-header-right">
        <span className="clipboard-history-count">{countLabel}</span>
        <div className="clipboard-history-filter-bar" role="tablist" aria-label={t('clipboardHistoryTab.filters.aria', { defaultValue: '剪贴板类型筛选' })}>
          {CLIPBOARD_HISTORY_FILTERS.map((filter) => (
            <button
              key={filter}
              className={`clipboard-history-filter${activeFilter === filter ? ' clipboard-history-filter--active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter}
              onClick={() => onFilterChange(filter)}
            >
              {t(CLIPBOARD_HISTORY_FILTER_LABEL_KEYS[filter], {
                defaultValue: CLIPBOARD_HISTORY_FILTER_DEFAULT_LABELS[filter],
              })}
            </button>
          ))}
        </div>
        <button
          className="clipboard-history-clear"
          type="button"
          onClick={onClear}
          disabled={totalCount === 0}
        >
          {t('clipboardHistoryTab.actions.clear', { defaultValue: '清空' })}
        </button>
        <button
          className="clipboard-history-export"
          type="button"
          onClick={onExport}
          disabled={exportCount === 0}
          title={selectionMode && selectedCount > 0
            ? t('clipboardHistoryTab.actions.exportSelectedTitle', { defaultValue: '导出已选记录' })
            : t('clipboardHistoryTab.actions.exportAllTitle', { defaultValue: '导出全部记录' })}
        >
          {t('clipboardHistoryTab.actions.export', { defaultValue: '导出' })}
          {selectionMode && selectedCount > 0 ? ` (${selectedCount})` : ''}
        </button>
        <button
          className={`clipboard-history-select-toggle${selectionMode ? ' clipboard-history-select-toggle--active' : ''}`}
          type="button"
          onClick={onToggleSelectionMode}
          disabled={totalCount === 0}
        >
          {selectionMode
            ? t('clipboardHistoryTab.actions.cancelSelect', { defaultValue: '取消' })
            : t('clipboardHistoryTab.actions.select', { defaultValue: '选择' })}
        </button>
      </div>
    </div>
  );
}
