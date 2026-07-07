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
 * @file useWaveInit.ts
 * @description 波浪背景 WebGL 上下文初始化 Hook
 * @author 鸡哥
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { initWaveGl } from '../utils/initWaveGl';
import type { WaveGlContext } from '../types';

/**
 * 首次 playing=true 时初始化 WebGL 上下文与着色器。
 * @param canvasRef - 画布引用
 * @param playing - 是否激活
 * @returns glRef — 跨 effect 生命周期持久化的 WebGL 资源
 */
export function useWaveInit(canvasRef: RefObject<HTMLCanvasElement | null>, playing: boolean): React.MutableRefObject<WaveGlContext | null> {
  const glRef = useRef<WaveGlContext | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (glRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    glRef.current = initWaveGl(canvas);
  }, [canvasRef, playing]);

  return glRef;
}
