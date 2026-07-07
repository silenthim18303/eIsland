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
 * @file useWaveLoop.ts
 * @description 波浪背景 RAF 渲染循环 Hook
 * @author 鸡哥
 */

import { useEffect } from 'react';
import type { RefObject } from 'react';
import { drawWave } from '../utils/drawWave';
import type { RgbTuple, WaveGlContext } from '../types';

/**
 * RAF 渲染循环，playing=true 时运行，playing=false 时停止。
 * @param canvasRef - 画布引用
 * @param playing - 是否播放渲染循环
 * @param glRef - 已初始化的 WebGL 上下文 ref
 * @param bgColorRef - 背景色 ref，每帧读取最新值
 * @param accentColorRef - 强调色 ref，每帧读取最新值
 */
export function useWaveLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  playing: boolean,
  glRef: React.MutableRefObject<WaveGlContext | null>,
  bgColorRef: React.MutableRefObject<RgbTuple>,
  accentColorRef: React.MutableRefObject<RgbTuple>,
): void {
  useEffect(() => {
    if (!playing) return;

    const ctx = glRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    let rafId = 0;

    const frame = (): void => {
      drawWave(ctx, canvas, bgColorRef.current, accentColorRef.current);
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => { cancelAnimationFrame(rafId); };
  }, [canvasRef, playing]);
}
