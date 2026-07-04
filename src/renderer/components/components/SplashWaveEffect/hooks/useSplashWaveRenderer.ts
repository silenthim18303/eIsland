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
 * @file useSplashWaveRenderer.ts
 * @description 启动画面波浪背景 WebGL 渲染生命周期 Hook。
 * @author 鸡哥
 */

import { useEffect } from 'react';
import type { RefObject } from 'react';
import {
  SPLASH_WAVE_FRAGMENT_SHADER,
  SPLASH_WAVE_VERTEX_SHADER,
} from '../config/splashWaveShaders';
import { compileSplashWaveShader } from '../utils/compileSplashWaveShader';

/**
 * 将 WebGL 电子音浪渲染绑定到画布生命周期。
 * @param canvasRef - 需要承载波浪背景的画布引用。
 * @returns 无返回值。
 */
export function useSplashWaveRenderer(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return;

    const vert = compileSplashWaveShader(gl, gl.VERTEX_SHADER, SPLASH_WAVE_VERTEX_SHADER);
    const frag = compileSplashWaveShader(gl, gl.FRAGMENT_SHADER, SPLASH_WAVE_FRAGMENT_SHADER);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.deleteShader(vert);
    gl.deleteShader(frag);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[SplashWave] shader link failed:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'aPosition');
    const resLoc = gl.getUniformLocation(program, 'uResolution');
    const timeLoc = gl.getUniformLocation(program, 'uTime');

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    const startTime = performance.now();
    let rafId = 0;

    const draw = (): void => {
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
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [canvasRef]);
}