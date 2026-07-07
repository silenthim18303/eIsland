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
