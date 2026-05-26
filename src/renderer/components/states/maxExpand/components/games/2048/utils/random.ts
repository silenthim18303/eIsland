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
 * @file random.ts
 * @description 2048 使用的确定性随机数工具。
 * @author 鸡哥
 */

export class DeterministicRandom {
  private state: number;

  constructor(seed: number) {
    const normalized = (seed >>> 0) || 1;
    this.state = normalized;
  }

  nextInt(bound: number): number {
    if (bound <= 1) return 0;
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state % bound;
  }

  nextDouble(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 4294967296;
  }

  getState(): number {
    return this.state;
  }
}
