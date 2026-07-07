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
 * @file types/index.ts
 * @description 波浪背景组件类型定义
 * @author 鸡哥
 */

/** RGB 颜色三元组，各分量范围 0-1 */
export type RgbTuple = [number, number, number];

/** WaveEffect 组件属性 */
export interface WaveEffectProps {
  /** 是否播放渲染循环，默认 true。实际启动画面始终为 true，预览区按需控制。 */
  playing?: boolean;
  /** 背景颜色十六进制值，传入时优先于 store 读取。预览区用于实时跟随颜色选择器。 */
  color?: string;
  /** 波纹强调色 [r, g, b]，各分量范围 0-1。默认蓝色。 */
  accentColor?: RgbTuple;
}

/** WebGL 渲染上下文，包含着色器程序与所有 uniform/attribute 位置 */
export interface WaveGlContext {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  posLoc: number;
  resLoc: WebGLUniformLocation | null;
  timeLoc: WebGLUniformLocation | null;
  bgColorLoc: WebGLUniformLocation | null;
  accentColorLoc: WebGLUniformLocation | null;
  startTime: number;
}
