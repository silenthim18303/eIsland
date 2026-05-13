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
 * @file useGuideNavigation.ts
 * @description 引导页导航编排 Hook — 组合 useGuidePage 与 useGuideCardScroll
 * @author 鸡哥
 */

import type { MutableRefObject, WheelEvent } from 'react';
import type { GuidePage } from '../config/guideContentConfig';
import { useGuidePage } from './useGuidePage';
import { useGuideCardScroll } from './useGuideCardScroll';

export interface UseGuideNavigationParams {
  guidePages: GuidePage[];
  interactionCardsLength: number;
  musicCardsLength: number;
  toolCardsLength: number;
  settingCardsLength: number;
}

export interface UseGuideNavigationResult {
  page: number;
  setPage: (updater: number | ((prev: number) => number)) => void;
  cardIndex: number;
  animDirRef: MutableRefObject<'up' | 'down'>;
  isLast: boolean;
  handleCardWheel: (e: WheelEvent) => void;
  handlePrev: () => void;
  handleNext: (onFinish: () => void) => void;
  resetGuideState: () => void;
}

/**
 * 组合引导页分页与卡片滚轮切换逻辑。
 * @param params - 引导导航参数。
 * @returns 引导页导航状态与事件处理器。
 */
export function useGuideNavigation({
  guidePages,
  interactionCardsLength,
  musicCardsLength,
  toolCardsLength,
  settingCardsLength,
}: UseGuideNavigationParams): UseGuideNavigationResult {
  const {
    page,
    setPage,
    isLast,
    handlePrev,
    handleNext,
    resetGuideState,
  } = useGuidePage(guidePages.length);

  const {
    cardIndex,
    animDirRef,
    handleCardWheel,
  } = useGuideCardScroll({
    page,
    guidePages,
    interactionCardsLength,
    musicCardsLength,
    toolCardsLength,
    settingCardsLength,
  });

  return {
    page,
    setPage,
    cardIndex,
    animDirRef,
    isLast,
    handleCardWheel,
    handlePrev,
    handleNext,
    resetGuideState,
  };
}
