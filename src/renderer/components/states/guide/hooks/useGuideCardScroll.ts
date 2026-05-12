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
 * @file useGuideCardScroll.ts
 * @description 引导页卡片滚轮切换状态 Hook
 * @author 鸡哥
 */

import { useCallback, useEffect, useRef, useState, type MutableRefObject, type WheelEvent } from 'react';
import type { GuidePage } from '../config/guideContentConfig';

interface UseGuideCardScrollParams {
  page: number;
  guidePages: GuidePage[];
  interactionCardsLength: number;
  musicCardsLength: number;
  toolCardsLength: number;
  settingCardsLength: number;
}

export interface UseGuideCardScrollResult {
  cardIndex: number;
  animDirRef: MutableRefObject<'up' | 'down'>;
  handleCardWheel: (e: WheelEvent) => void;
}

export function useGuideCardScroll({
  page,
  guidePages,
  interactionCardsLength,
  musicCardsLength,
  toolCardsLength,
  settingCardsLength,
}: UseGuideCardScrollParams): UseGuideCardScrollResult {
  const [cardIndex, setCardIndex] = useState(0);
  const animDirRef = useRef<'up' | 'down'>('down');
  const wheelCooldownRef = useRef(false);
  const cardCountRef = useRef(interactionCardsLength);

  useEffect(() => {
    const p = guidePages[page];
    if (p?.interactive === 'basic') cardCountRef.current = interactionCardsLength;
    else if (p?.interactive === 'music') cardCountRef.current = musicCardsLength;
    else if (p?.interactive === 'tools') cardCountRef.current = toolCardsLength;
    else if (p?.interactive === 'settings') cardCountRef.current = settingCardsLength;
    else cardCountRef.current = 0;
    setCardIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleCardWheel = useCallback((e: WheelEvent) => {
    e.stopPropagation();
    if (wheelCooldownRef.current) return;
    wheelCooldownRef.current = true;
    setTimeout(() => {
      wheelCooldownRef.current = false;
    }, 400);

    if (e.deltaY > 0) {
      animDirRef.current = 'down';
      setCardIndex((prev) => Math.min(prev + 1, cardCountRef.current - 1));
    } else if (e.deltaY < 0) {
      animDirRef.current = 'up';
      setCardIndex((prev) => Math.max(prev - 1, 0));
    }
  }, []);

  return {
    cardIndex,
    animDirRef,
    handleCardWheel,
  };
}
