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
 * @file useGuidePage.ts
 * @description 引导页分页状态与导航 Hook
 * @author 鸡哥
 */

import { useCallback, useEffect, useState } from 'react';

let lastGuidePage = 0;

export interface UseGuidePageResult {
  page: number;
  setPage: (updater: number | ((prev: number) => number)) => void;
  isLast: boolean;
  handlePrev: () => void;
  handleNext: (onFinish: () => void) => void;
  resetGuideState: () => void;
}

/**
 * 管理引导页分页与前进后退逻辑。
 * @param pageCount - 引导页总页数。
 * @returns 引导页分页状态与导航函数。
 */
export function useGuidePage(pageCount: number): UseGuidePageResult {
  const [page, setPageState] = useState(() => lastGuidePage);

  const isLast = page === pageCount - 1;

  useEffect(() => {
    lastGuidePage = page;
  }, [page]);

  useEffect(() => {
    if (page <= pageCount - 1) return;
    setPageState(Math.max(pageCount - 1, 0));
  }, [pageCount, page]);

  const handlePrev = useCallback(() => {
    setPageState((p) => Math.max(0, p - 1));
  }, []);

  const handleNext = useCallback((onFinish: () => void) => {
    if (isLast) {
      onFinish();
    } else {
      setPageState((p) => p + 1);
    }
  }, [isLast]);

  const setPage = useCallback((updater: number | ((prev: number) => number)) => {
    if (typeof updater === 'number') {
      setPageState(updater);
      return;
    }
    setPageState(updater);
  }, []);

  const resetGuideState = useCallback(() => {
    lastGuidePage = 0;
  }, []);

  return {
    page,
    setPage,
    isLast,
    handlePrev,
    handleNext,
    resetGuideState,
  };
}
