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
 * @description Simplex 噪声流动效果的常量配置
 * @author 鸡哥
 */

import type { RgbColor } from '../types/simplexFlow'

export const SIMPLEX_SKEW = 0.3660254037844386
export const SIMPLEX_UNSKEW = 0.21132486540518713
export const FIELD_SCALE = 0.0019
export const SAMPLE_RATIO = 0.1
export const POINTER_RADIUS = 340

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

export const PALETTE: readonly RgbColor[] = [
  [4, 10, 28],
  [7, 22, 54],
  [10, 44, 96],
  [18, 82, 156],
]

export const PERMUTATION: readonly number[] = (() => {
  const source = new Uint8Array(256)
  for (let i = 0; i < 256; i += 1) source[i] = i
  for (let i = 255; i > 0; i -= 1) {
    const seed = (Math.sin(i * 12.9898) * 43758.5453) % 1
    const j = Math.floor((seed + 1) % 1 * (i + 1))
    const tmp = source[i]
    source[i] = source[j]
    source[j] = tmp
  }
  const table = new Uint8Array(512)
  for (let i = 0; i < 512; i += 1) table[i] = source[i & 255]
  return [...table]
})()
