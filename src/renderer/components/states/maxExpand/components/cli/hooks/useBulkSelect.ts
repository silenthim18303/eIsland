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
 * @file useBulkSelect.ts
 * @description CLI 会话批量选择逻辑 Hook
 * @author 鸡哥
 */

import { useState, useEffect, useCallback } from 'react';
import type { CliSessionSnapshot } from '../types/types';

/**
 * 管理会话批量选择状态
 * @param sessions - 当前会话列表（用于自动清理已删除会话的选中态）
 * @param deleteSessions - 删除会话的回调
 * @param selectedSessionId - 当前单选的会话 id
 * @param setSelectedSessionId - 清除单选的回调
 * @returns 批量选择相关状态与操作
 */
export function useBulkSelect(
  sessions: CliSessionSnapshot[],
  deleteSessions: (ids: string[]) => Promise<void>,
  selectedSessionId: string | null,
  setSelectedSessionId: (id: string | null) => void,
) {
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(() => new Set());

  const handleToggleBulkSelect = useCallback((): void => {
    setBulkSelectMode((enabled) => {
      if (enabled) setSelectedSessionIds(new Set());
      return !enabled;
    });
  }, []);

  const handleToggleSessionSelection = useCallback((id: string): void => {
    setSelectedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDeleteSelectedSessions = useCallback((): void => {
    if (selectedSessionIds.size === 0) return;
    const deletedIds = Array.from(selectedSessionIds);
    deleteSessions(deletedIds).catch(() => {});
    if (selectedSessionId && selectedSessionIds.has(selectedSessionId)) setSelectedSessionId(null);
    setSelectedSessionIds(new Set());
    setBulkSelectMode(false);
  }, [deleteSessions, selectedSessionId, selectedSessionIds, setSelectedSessionId]);

  // 会话列表变化时清理已不存在的选中 id
  useEffect(() => {
    const sessionIds = new Set(sessions.map((session) => session.id));
    setSelectedSessionIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => sessionIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
    if (sessions.length === 0) setBulkSelectMode(false);
  }, [sessions]);

  return {
    bulkSelectMode,
    selectedSessionIds,
    selectedSessionCount: selectedSessionIds.size,
    handleToggleBulkSelect,
    handleToggleSessionSelection,
    handleDeleteSelectedSessions,
  };
}
