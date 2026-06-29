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
 * @file simplexFlow.ts
 * @description Simplex Flow 背景动画配置常量
 * @author 鸡哥
 */

/** RGB color triplet */
export type RgbColor = readonly [number, number, number]

/** Simplex noise skew factor */
export const SIMPLEX_SKEW = 0.3660254037844386

/** Simplex noise unskew factor */
export const SIMPLEX_UNSKEW = 0.21132486540518713

/** Field scale for noise sampling */
export const FIELD_SCALE = 0.0019

/** Sample ratio for canvas rendering */
export const SAMPLE_RATIO = 0.1

/** Pointer influence radius */
export const POINTER_RADIUS = 340

/** Gradient vectors for simplex noise */
export const GRADIENTS: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

/** Color palette for flow visualization */
export const PALETTE: readonly RgbColor[] = [
  [4, 10, 28],
  [7, 22, 54],
  [10, 44, 96],
  [18, 82, 156],
]
