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
 * @file useIslandShellPresentation.ts
 * @description 灵动岛壳层 className 与样式计算 Hook。
 * @author 鸡哥
 */

import { useMemo } from 'react';
import { STATE_AREA, getStateClassName } from '../config/dynamicIslandConfig';
import type { TranslationLyricsResult } from '../../api/lyrics/lrcApi';

interface UseIslandShellPresentationOptions {
  state: string;
  morphing: boolean;
  fromState: string;
  showGlow: string | null;
  springAnimation: boolean;
  animationSpeed: string;
  dominantColor: [number, number, number];
  translationLyrics: TranslationLyricsResult | null;
}

interface IslandShellPresentationState {
  shellClassName: string;
  shellStyle: React.CSSProperties | undefined;
}

/**
 * @description 计算灵动岛壳层展示所需类名与样式。
 * @param options - 壳层展示计算参数。
 * @returns 壳层 className 与 style。
 */
export function useIslandShellPresentation(options: UseIslandShellPresentationOptions): IslandShellPresentationState {
  const {
    state,
    morphing,
    fromState,
    showGlow,
    springAnimation,
    animationSpeed,
    dominantColor,
    translationLyrics,
  } = options;

  const hasTranslation = state === 'lyrics'
    && translationLyrics?.status === 'available'
    && Boolean(translationLyrics.lines && translationLyrics.lines.length > 0);

  const shellClassName = useMemo(() => {
    const stateAreaMap = STATE_AREA as Record<string, number>;
    const instantResize = morphing
      && fromState
      && (stateAreaMap[fromState] ?? 0) > (stateAreaMap[state] ?? 0);

    return `island-shell ${getStateClassName(state as Parameters<typeof getStateClassName>[0])}${morphing ? ' morphing' : ''}${fromState ? ` from-${fromState}` : ''}${instantResize ? ' instant-resize' : ''}${showGlow ? ' music-glow' : ''}${showGlow === 'paused' ? ' music-paused' : ''}${springAnimation ? ' spring-animation' : ''}${hasTranslation ? ' has-translation' : ''} speed-${animationSpeed}`;
  }, [state, morphing, fromState, showGlow, springAnimation, animationSpeed, hasTranslation]);

  const shellStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!showGlow) return undefined;
    const [r, g, b] = dominantColor;
    return {
      '--glow-r': r,
      '--glow-g': g,
      '--glow-b': b,
    } as React.CSSProperties;
  }, [showGlow, dominantColor]);

  return {
    shellClassName,
    shellStyle,
  };
}
