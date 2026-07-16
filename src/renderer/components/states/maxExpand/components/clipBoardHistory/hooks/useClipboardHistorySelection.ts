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
 * @file useClipboardHistorySelection.ts
 * @description 剪贴板历史选择模式与批量操作 hook。
 * @author 鸡哥
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SELECTION_COLLAPSE_ANIMATION_MS } from '../config/clipboardHistoryConfig';
import type { ClipboardCleanupRange, ClipboardHistoryFilter, ClipboardHistoryItem, UseClipboardHistorySelectionReturn } from '../types/clipboardHistoryTypes';
import { isItemInCleanupRange, matchesClipboardFilter } from '../utils/clipboardHistoryUtils';

/**
 * 管理选择模式、多选状态、筛选、批量删除/清理
 * @param items - 全部条目
 * @param setItems - 条目 setter
 * @param expandedId - 当前展开条目 ID
 * @param setExpandedId - 展开条目 setter
 * @param setEditText - 编辑文本 setter
 */
export function useClipboardHistorySelection(
  items: ClipboardHistoryItem[],
  setItems: React.Dispatch<React.SetStateAction<ClipboardHistoryItem[]>>,
  expandedId: number | null,
  setExpandedId: React.Dispatch<React.SetStateAction<number | null>>,
  setEditText: React.Dispatch<React.SetStateAction<string>>,
): UseClipboardHistorySelectionReturn {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectionCollapsing, setSelectionCollapsing] = useState(false);
  const [cleanupRange, setCleanupRange] = useState<ClipboardCleanupRange>('today');
  const [activeFilter, setActiveFilter] = useState<ClipboardHistoryFilter>('all');
  const selectionCollapseTimerRef = useRef<number | null>(null);

  /* ── 筛选后可见条目 ── */
  const visibleItems = useMemo(
    () => items.filter((item) => matchesClipboardFilter(item, activeFilter)),
    [activeFilter, items],
  );

  /* ── 条目变化时清理已失效的选中 ID ── */
  useEffect(() => {
    const itemIds = new Set(items.map((item) => item.id));
    setSelectedIds((prev) => prev.filter((id) => itemIds.has(id)));
  }, [items]);

  /* ── 组件卸载时清理定时器 ── */
  useEffect(() => () => {
    if (selectionCollapseTimerRef.current !== null) {
      window.clearTimeout(selectionCollapseTimerRef.current);
    }
  }, []);

  /* ── 计算属性 ── */
  const selectedCount = selectedIds.length;
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleIdSet = useMemo(() => new Set(visibleItems.map((item) => item.id)), [visibleItems]);
  const visibleCount = visibleItems.length;
  const allSelected = visibleCount > 0 && visibleItems.every((item) => selectedIdSet.has(item.id));
  const cleanupMatchedIdSet = useMemo(() => {
    const now = Date.now();
    return new Set(visibleItems.filter((item) => isItemInCleanupRange(item, cleanupRange, now)).map((item) => item.id));
  }, [visibleItems, cleanupRange]);
  const cleanupMatchedCount = cleanupMatchedIdSet.size;

  /* ── 收起选择模式（带动画） ── */
  const collapseSelectionMode = useCallback((): void => {
    if (!selectionMode || selectionCollapsing) return;
    setSelectionCollapsing(true);
    if (selectionCollapseTimerRef.current !== null) {
      window.clearTimeout(selectionCollapseTimerRef.current);
    }
    selectionCollapseTimerRef.current = window.setTimeout(() => {
      setSelectionMode(false);
      setSelectionCollapsing(false);
      setSelectedIds([]);
      selectionCollapseTimerRef.current = null;
    }, SELECTION_COLLAPSE_ANIMATION_MS);
  }, [selectionMode, selectionCollapsing]);

  /* ── 切换选择模式 ── */
  const handleToggleSelectionMode = useCallback((): void => {
    if (selectionMode) {
      collapseSelectionMode();
      return;
    }
    if (selectionCollapseTimerRef.current !== null) {
      window.clearTimeout(selectionCollapseTimerRef.current);
      selectionCollapseTimerRef.current = null;
    }
    setSelectionCollapsing(false);
    setSelectionMode(true);
    setSelectedIds(Array.from(cleanupMatchedIdSet));
  }, [selectionMode, collapseSelectionMode, cleanupMatchedIdSet]);

  /* ── 单条勾选/取消 ── */
  const handleToggleSelect = useCallback((id: number): void => {
    setSelectedIds((prev) => (
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    ));
  }, []);

  /* ── 全选/取消全选（当前筛选范围内） ── */
  const handleToggleSelectAll = useCallback((): void => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIdSet.has(id)));
      return;
    }
    setSelectedIds((prev) => Array.from(new Set([
      ...prev,
      ...visibleItems.map((item) => item.id),
    ])));
  }, [allSelected, visibleIdSet, visibleItems]);

  /* ── 清理范围变化 ── */
  const handleCleanupRangeChange = useCallback((range: ClipboardCleanupRange): void => {
    const now = Date.now();
    setCleanupRange(range);
    setSelectedIds(visibleItems.filter((item) => isItemInCleanupRange(item, range, now)).map((item) => item.id));
  }, [visibleItems]);

  /* ── 筛选类型变化 ── */
  const handleFilterChange = useCallback((filter: ClipboardHistoryFilter): void => {
    setActiveFilter(filter);
    setSelectedIds([]);
    if (expandedId !== null) {
      const expandedItem = items.find((item) => item.id === expandedId);
      if (expandedItem && !matchesClipboardFilter(expandedItem, filter)) {
        setExpandedId(null);
        setEditText('');
      }
    }
  }, [expandedId, items, setExpandedId, setEditText]);

  /* ── 删除已选条目 ── */
  const handleRemoveSelected = useCallback((): void => {
    if (selectedIds.length === 0) return;
    const nextSelectedIds = new Set(selectedIds);
    setItems((prev) => prev.filter((item) => !nextSelectedIds.has(item.id)));
    setSelectedIds([]);
    setSelectionMode(false);
    setSelectionCollapsing(false);
    if (expandedId !== null && nextSelectedIds.has(expandedId)) {
      setExpandedId(null);
      setEditText('');
    }
  }, [selectedIds, expandedId, setItems, setExpandedId, setEditText]);

  /* ── 按时间范围清理 ── */
  const handleClearByRange = useCallback((): void => {
    const now = Date.now();
    const removedIds = new Set(items.filter((item) => isItemInCleanupRange(item, cleanupRange, now)).map((item) => item.id));
    if (removedIds.size === 0) return;
    setItems((prev) => prev.filter((item) => !removedIds.has(item.id)));
    setSelectedIds((prev) => prev.filter((id) => !removedIds.has(id)));
    setSelectionMode(false);
    setSelectionCollapsing(false);
    if (expandedId !== null && removedIds.has(expandedId)) {
      setExpandedId(null);
      setEditText('');
    }
  }, [items, cleanupRange, expandedId, setItems, setExpandedId, setEditText]);

  return {
    selectedIds, setSelectedIds, selectionMode, setSelectionMode,
    selectionCollapsing, setSelectionCollapsing, cleanupRange,
    activeFilter, setActiveFilter,
    selectedCount, selectedIdSet, visibleIdSet, allSelected,
    cleanupMatchedIdSet, cleanupMatchedCount,
    handleToggleSelectionMode, handleToggleSelect, handleToggleSelectAll,
    handleCleanupRangeChange, handleFilterChange,
    handleRemoveSelected, handleClearByRange,
  };
}
