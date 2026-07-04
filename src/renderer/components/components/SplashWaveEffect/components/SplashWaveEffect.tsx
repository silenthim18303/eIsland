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
 * @file SplashWaveEffect.tsx
 * @description 启动画面波浪背景 React 组件。
 * @author 鸡哥
 */

import { useRef } from 'react';
import type { ReactElement } from 'react';
import { useSplashWaveRenderer } from '../hooks/useSplashWaveRenderer';

/**
 * 渲染启动画面波浪背景画布。
 * @returns 启动画面波浪背景节点。
 */
export function SplashWaveEffect(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useSplashWaveRenderer(canvasRef);

  return <canvas ref={canvasRef} className="splash-wave-canvas" />;
}