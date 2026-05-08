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

import { useCallback, useEffect, useRef, useState } from 'react';

export type IslandState = 'idle' | 'hover' | 'expanded' | 'notification' | 'maxExpand' | 'minimal' | 'lyrics' | 'guide' | 'login' | 'register' | 'payment' | 'announcement' | 'agentVoiceInput' | 'agent' | 'stt';

const MORPH_DURATION_BY_SPEED: Record<string, number> = { slow: 1100, medium: 550, fast: 280 };

interface UseDynamicIslandShellOptions {
  state: IslandState;
  animationSpeed: string;
  isMusicPlaying: boolean;
  coverImage: string | null;
  isPlaying: boolean;
  setHover: () => void;
  setExpanded: () => void;
  idleClickExpandRef: React.MutableRefObject<boolean>;
  isHoveringRef: React.MutableRefObject<boolean>;
}

interface DynamicIslandShellState {
  morphing: boolean;
  fromState: string;
  showGlow: string | null;
  handleIslandClick: () => void;
}

export function useDynamicIslandShell(options: UseDynamicIslandShellOptions): DynamicIslandShellState {
  const {
    state,
    animationSpeed,
    isMusicPlaying,
    coverImage,
    isPlaying,
    setHover,
    setExpanded,
    idleClickExpandRef,
    isHoveringRef,
  } = options;

  const prevStateRef = useRef(state);
  const [morphing, setMorphing] = useState(false);
  const [fromState, setFromState] = useState('');

  useEffect(() => {
    if (prevStateRef.current === state) return;
    setFromState(prevStateRef.current);
    prevStateRef.current = state;
    setMorphing(true);
    const id = setTimeout(() => {
      setMorphing(false);
      setFromState('');
    }, MORPH_DURATION_BY_SPEED[animationSpeed] ?? 550);
    return () => clearTimeout(id);
  }, [state, animationSpeed]);

  const handleIslandClick = useCallback(() => {
    if (state === 'idle' && idleClickExpandRef.current) {
      isHoveringRef.current = true;
      setHover();
      return;
    }

    if (state === 'hover') {
      setExpanded();
      return;
    }

    if (state === 'expanded' || state === 'maxExpand' || state === 'announcement') {
      setHover();
    }
  }, [state, setExpanded, setHover, idleClickExpandRef, isHoveringRef]);

  return {
    morphing,
    fromState,
    showGlow: isMusicPlaying && coverImage ? (isPlaying ? 'playing' : 'paused') : null,
    handleIslandClick,
  };
}
