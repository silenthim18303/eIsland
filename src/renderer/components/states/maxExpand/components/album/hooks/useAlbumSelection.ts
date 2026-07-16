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
 * @file useAlbumSelection.ts
 * @description 相册多选管理 hook — 选中态、全选/取消、批量删除联动。
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import type { AlbumItem } from '../types/albumTypes';

/** useAlbumSelection 返回值类型 */
export interface UseAlbumSelectionReturn {
  selectedIds: Set<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  selectMode: boolean;
  selectedCount: number;
  visibleSelectedCount: number;
  allVisibleSelected: boolean;
  handleToggleItemSelection: (id: number) => void;
  handleSelectAllVisible: () => void;
  handleClearSelection: () => void;
  handleToggleSelectMode: () => void;
  /** 批量删除选中条目（联动清除查看器 activeId） */
  handleRemoveSelectedItems: () => void;
}

/** 相册多选管理 hook */
export function useAlbumSelection(
  items: AlbumItem[],
  filteredItems: AlbumItem[],
  activeId: number | null,
  setActiveId: React.Dispatch<React.SetStateAction<number | null>>,
  removeItemsByIds: (ids: Set<number>) => void,
): UseAlbumSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [selectMode, setSelectMode] = useState(false);

  /** items 变更时清理已不存在的选中 ID */
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const existing = new Set(items.map((item) => item.id));
      const next = new Set<number>();
      prev.forEach((id) => {
        if (existing.has(id)) next.add(id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [items]);

  const selectedCount = selectedIds.size;
  const visibleSelectedCount = filteredItems.filter((item) => selectedIds.has(item.id)).length;
  const allVisibleSelected = filteredItems.length > 0 && visibleSelectedCount === filteredItems.length;

  const handleToggleItemSelection = (id: number): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllVisible = (): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredItems.forEach((item) => next.delete(item.id));
      } else {
        filteredItems.forEach((item) => next.add(item.id));
      }
      return next;
    });
  };

  const handleClearSelection = (): void => {
    setSelectedIds(new Set());
  };

  const handleToggleSelectMode = (): void => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  /** 批量删除选中条目（联动清除查看器 activeId） */
  const handleRemoveSelectedItems = (): void => {
    if (selectedIds.size === 0) return;
    if (activeId !== null && selectedIds.has(activeId)) setActiveId(null);
    removeItemsByIds(selectedIds);
    handleClearSelection();
  };

  return {
    selectedIds,
    setSelectedIds,
    selectMode,
    selectedCount,
    visibleSelectedCount,
    allVisibleSelected,
    handleToggleItemSelection,
    handleSelectAllVisible,
    handleClearSelection,
    handleToggleSelectMode,
    handleRemoveSelectedItems,
  };
}
