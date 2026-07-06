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

/** 着色器原始背景颜色 vec3(0.002, 0.004, 0.005) */
const SHADER_DEFAULT_BG_RGB: [number, number, number] = [0.002, 0.004, 0.005];

/**
 * 将十六进制颜色转换为归一化 RGB 分量。
 * @param hex - 十六进制颜色字符串（如 #000000）。
 * @returns 归一化 RGB 三元组，各分量范围 0-1。
 */
function hexToRgbNorm(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return SHADER_DEFAULT_BG_RGB;
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

interface WaveEffectProps {
  /** 是否播放渲染循环，默认 true。实际启动画面始终为 true，预览区按需控制。 */
  playing?: boolean;
  /** 背景颜色十六进制值，传入时优先于 store 读取。预览区用于实时跟随颜色选择器。 */
  color?: string;
  /** 波纹强调色 [r, g, b]，各分量范围 0-1。默认蓝色。 */
  accentColor?: [number, number, number];
}

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