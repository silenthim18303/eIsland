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
 * @file WaveEffect.tsx
 * @description 波浪背景 React 组件。
 * @author 鸡哥
 */

import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useWaveRenderer } from '../hooks/useWaveRenderer';
import { hexToRgbNorm, SHADER_DEFAULT_BG_RGB } from '../utils/color';
import type { WaveEffectProps } from '../types';

/**
 * 渲染波浪背景画布。
 * @param playing - 是否播放渲染循环。
 * @param color - 背景颜色十六进制值，优先于 store。
 * @returns 波浪背景节点。
 */
export function WaveEffect({ playing = true, color, accentColor }: WaveEffectProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgColor, setBgColor] = useState<[number, number, number]>(SHADER_DEFAULT_BG_RGB);

  useEffect(() => {
    if (color) {
      setBgColor(hexToRgbNorm(color));
      return;
    }
    window.api.storeRead('splash-bg-color').then((v) => {
      if (typeof v === 'string' && v) setBgColor(hexToRgbNorm(v));
    }).catch(() => {});
  }, [color]);

  useWaveRenderer(canvasRef, bgColor, playing, accentColor);

  return <canvas ref={canvasRef} className="splash-wave-canvas" />;
}
