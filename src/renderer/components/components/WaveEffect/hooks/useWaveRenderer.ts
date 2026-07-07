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
 * @file useWaveRenderer.ts
 * @description 波浪背景 WebGL 渲染生命周期 Hook。
 * @author 鸡哥
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { DEFAULT_ACCENT_COLOR } from '../utils/constants';
import { initWaveGl } from '../utils/initWaveGl';
import { startWaveLoop } from '../utils/drawWave';
import type { WaveGlContext } from '../types';

/**
 * 将 WebGL 电子音浪渲染绑定到画布生命周期。
 * WebGL 上下文在首次 playing=true 时创建并复用，后续仅控制 RAF 循环。
 * @param canvasRef - 需要承载波浪背景的画布引用。
 * @param bgColor - 背景颜色 [r, g, b]，各分量范围 0-1。通过 ref 传递，draw 循环每帧读取最新值。
 * @param playing - 是否播放渲染循环。
 * @param accentColor - 强调色 [r, g, b]，默认 DEFAULT_ACCENT_COLOR。
 * @returns 无返回值。
 */
export function useWaveRenderer(canvasRef: RefObject<HTMLCanvasElement | null>, bgColor: [number, number, number], playing = true, accentColor: [number, number, number] = DEFAULT_ACCENT_COLOR): void {
  const bgColorRef = useRef(bgColor);
  bgColorRef.current = bgColor;
  const accentColorRef = useRef(accentColor);
  accentColorRef.current = accentColor;

  /** 跨 effect 生命周期持久化的 WebGL 资源 */
  const glRef = useRef<WaveGlContext | null>(null);

  /** 首次 playing=true 时初始化 WebGL 上下文与着色器 */
  useEffect(() => {
    if (!playing) return;
    if (glRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    glRef.current = initWaveGl(canvas);
  }, [canvasRef, playing]);

  /** RAF 渲染循环，playing=true 时运行，playing=false 时停止 */
  useEffect(() => {
    if (!playing) return;

    const ctx = glRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    return startWaveLoop(ctx, canvas, bgColorRef, accentColorRef);
  }, [canvasRef, playing]);
}
