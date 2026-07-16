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
 * @file AlbumSelectionBar.tsx
 * @description 相册底部多选工具条：全选、清除、批量删除、取消。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

/** AlbumSelectionBar 组件入参 */
interface AlbumSelectionBarProps {
  /** 是否处于多选模式 */
  selectMode: boolean;
  /** 已选中数量 */
  selectedCount: number;
  /** 当前筛选后可见条目总数 */
  filteredCount: number;
  /** 所有可见项是否全部选中 */
  allVisibleSelected: boolean;
  /** 全选/取消全选 */
  onSelectAllVisible: () => void;
  /** 清除选中 */
  onClearSelection: () => void;
  /** 删除选中 */
  onRemoveSelected: () => void;
  /** 退出多选模式 */
  onToggleSelectMode: () => void;
}

/**
 * 相册底部多选工具条。
 */
export function AlbumSelectionBar({
  selectMode, selectedCount, filteredCount, allVisibleSelected,
  onSelectAllVisible, onClearSelection, onRemoveSelected, onToggleSelectMode,
}: AlbumSelectionBarProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className={`album-selection-bar${selectMode ? ' album-selection-bar--open' : ''}`} aria-hidden={!selectMode}>
      <span className="album-selection-bar-count">
        {selectedCount > 0
          ? t('albumTab.selection.selectedCount', { count: selectedCount })
          : t('albumTab.selection.hint')}
      </span>
      <button
        className="album-selection-bar-btn"
        type="button"
        onClick={onSelectAllVisible}
        disabled={filteredCount === 0}
        tabIndex={selectMode ? 0 : -1}
      >
        {allVisibleSelected ? t('albumTab.actions.unselectAllVisible') : t('albumTab.actions.selectAllVisible')}
      </button>
      <button
        className="album-selection-bar-btn"
        type="button"
        onClick={onClearSelection}
        disabled={selectedCount === 0}
        tabIndex={selectMode ? 0 : -1}
      >
        {t('albumTab.actions.clearSelection')}
      </button>
      <button
        className="album-selection-bar-btn album-selection-bar-btn--danger"
        type="button"
        onClick={onRemoveSelected}
        disabled={selectedCount === 0}
        tabIndex={selectMode ? 0 : -1}
      >
        {t('albumTab.actions.removeSelected')}
      </button>
      <button
        className="album-selection-bar-btn"
        type="button"
        onClick={onToggleSelectMode}
        tabIndex={selectMode ? 0 : -1}
      >
        {t('albumTab.actions.cancelSelect')}
      </button>
    </div>
  );
}
