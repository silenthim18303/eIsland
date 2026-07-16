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
 * @file useEventPagination.ts
 * @description CLI 事件列表分页 Hook
 * @author 鸡哥
 */

import { useState, useEffect, useRef } from 'react';
import type { CliHookEvent } from '../types/types';
import type { CliEventFilter } from '../config/cliFilters';
import { EVENTS_PER_PAGE } from '../config/cliConstants';

/**
 * 管理事件列表分页，筛选条件或会话切换时自动重置页码
 * @param filteredEvents - 当前筛选后的事件列表
 * @param eventFilter - 当前筛选条件
 * @param selectedSessionId - 当前选中的会话 id
 * @returns 分页状态与计算结果
 */
export function useEventPagination(
  filteredEvents: CliHookEvent[],
  eventFilter: CliEventFilter,
  selectedSessionId: string | null,
) {
  const [page, setPage] = useState(0);
  const prevFilterRef = useRef(eventFilter);
  const prevSessionRef = useRef(selectedSessionId);

  // 筛选条件变化时重置页码
  useEffect(() => {
    if (prevFilterRef.current !== eventFilter || prevSessionRef.current !== selectedSessionId) {
      prevFilterRef.current = eventFilter;
      prevSessionRef.current = selectedSessionId;
      setPage(0);
    }
  }, [eventFilter, selectedSessionId]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pagedEvents = filteredEvents.slice(currentPage * EVENTS_PER_PAGE, currentPage * EVENTS_PER_PAGE + EVENTS_PER_PAGE);

  return { page, setPage, totalPages, currentPage, pagedEvents };
}
