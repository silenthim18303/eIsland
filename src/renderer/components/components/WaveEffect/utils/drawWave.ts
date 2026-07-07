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
 * @file drawWave.ts
 * @description 波浪背景单帧渲染函数
 * @author 鸡哥
 */

import type { RgbTuple, WaveGlContext } from '../types';

/**
 * 执行一次波浪背景渲染。
 * 处理 DPR 缩放、画布尺寸同步、uniform 上传并绘制全屏三角形。
 * @param ctx - 已初始化的 WebGL 上下文
 * @param canvas - 渲染目标画布
 * @param bgColor - 背景色 [r, g, b]
 * @param accentColor - 强调色 [r, g, b]
 */
export function drawWave(ctx: WaveGlContext, canvas: HTMLCanvasElement, bgColor: RgbTuple, accentColor: RgbTuple): void {
  const { gl, program, buffer, posLoc, resLoc, timeLoc, bgColorLoc, accentColorLoc, startTime } = ctx;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  gl.viewport(0, 0, w, h);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.uniform2f(resLoc, w, h);
  gl.uniform1f(timeLoc, (performance.now() - startTime) / 1000);
  gl.uniform3f(bgColorLoc, bgColor[0], bgColor[1], bgColor[2]);
  gl.uniform3f(accentColorLoc, accentColor[0], accentColor[1], accentColor[2]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/**
 * 启动波浪背景 RAF 渲染循环。
 * @param ctx - 已初始化的 WebGL 上下文
 * @param canvas - 渲染目标画布
 * @param bgColorRef - 背景色 ref，每帧读取最新值
 * @param accentColorRef - 强调色 ref，每帧读取最新值
 * @returns 取消函数
 */
export function startWaveLoop(
  ctx: WaveGlContext,
  canvas: HTMLCanvasElement,
  bgColorRef: { current: RgbTuple },
  accentColorRef: { current: RgbTuple },
): () => void {
  let rafId = 0;

  const frame = (): void => {
    drawWave(ctx, canvas, bgColorRef.current, accentColorRef.current);
    rafId = requestAnimationFrame(frame);
  };

  rafId = requestAnimationFrame(frame);

  return () => { cancelAnimationFrame(rafId); };
}
