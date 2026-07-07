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
 * @file color.ts
 * @description 波浪背景颜色转换工具
 * @author 鸡哥
 */

import type { RgbTuple } from '../types';

/** 着色器原始背景颜色 vec3(0.002, 0.004, 0.005) */
export const SHADER_DEFAULT_BG_RGB: RgbTuple = [0.002, 0.004, 0.005];

/**
 * 将十六进制颜色转换为归一化 RGB 分量。
 * @param hex - 十六进制颜色字符串（如 #000000）。
 * @returns 归一化 RGB 三元组，各分量范围 0-1。
 */
export function hexToRgbNorm(hex: string): RgbTuple {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return SHADER_DEFAULT_BG_RGB;
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}
