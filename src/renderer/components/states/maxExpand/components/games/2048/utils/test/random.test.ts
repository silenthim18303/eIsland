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
 * @file random.test.ts
 * @description DeterministicRandom 单元测试
 * @author 鸡哥
 */

import { describe, it, expect } from 'vitest'
import { DeterministicRandom } from '../random'

describe('DeterministicRandom', () => {
  describe('constructor seed normalization', () => {
    it('should accept a normal positive seed', () => {
      const rng = new DeterministicRandom(42)
      expect(rng.getState()).toBe(42)
    })

    it('should normalize zero seed to 1', () => {
      const rng = new DeterministicRandom(0)
      expect(rng.getState()).toBe(1)
    })

    it('should convert negative seed to unsigned 32-bit integer', () => {
      const rng = new DeterministicRandom(-1)
      // -1 >>> 0 === 4294967295 (0xFFFFFFFF)
      expect(rng.getState()).toBe(4294967295)
    })

    it('should truncate a floating-point seed via unsigned right shift', () => {
      const rng = new DeterministicRandom(3.9)
      // 3.9 >>> 0 === 3
      expect(rng.getState()).toBe(3)
    })

    it('should normalize the smallest negative number correctly', () => {
      const rng = new DeterministicRandom(-2147483648)
      // -2147483648 >>> 0 === 2147483648 (0x80000000)
      expect(rng.getState()).toBe(2147483648)
    })
  })

  describe('nextInt', () => {
    it('should return 0 when bound is 0', () => {
      const rng = new DeterministicRandom(1)
      expect(rng.nextInt(0)).toBe(0)
    })

    it('should return 0 when bound is 1', () => {
      const rng = new DeterministicRandom(1)
      expect(rng.nextInt(1)).toBe(0)
    })

    it('should return 0 when bound is negative', () => {
      const rng = new DeterministicRandom(1)
      expect(rng.nextInt(-5)).toBe(0)
    })

    it('should return values in [0, bound) for valid bounds', () => {
      const rng = new DeterministicRandom(1)
      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(4)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(4)
      }
    })

    it('should produce a deterministic sequence for a given seed', () => {
      const rng1 = new DeterministicRandom(12345)
      const rng2 = new DeterministicRandom(12345)
      const sequence1 = Array.from({ length: 20 }, () => rng1.nextInt(10))
      const sequence2 = Array.from({ length: 20 }, () => rng2.nextInt(10))
      expect(sequence1).toEqual(sequence2)
    })

    it('should produce different sequences for different seeds', () => {
      const rng1 = new DeterministicRandom(1)
      const rng2 = new DeterministicRandom(2)
      const sequence1 = Array.from({ length: 10 }, () => rng1.nextInt(100))
      const sequence2 = Array.from({ length: 10 }, () => rng2.nextInt(100))
      expect(sequence1).not.toEqual(sequence2)
    })

    it('should advance internal state on each call', () => {
      const rng = new DeterministicRandom(42)
      const state0 = rng.getState()
      rng.nextInt(10)
      const state1 = rng.getState()
      rng.nextInt(10)
      const state2 = rng.getState()
      expect(state1).not.toBe(state0)
      expect(state2).not.toBe(state1)
    })
  })

  describe('nextDouble', () => {
    it('should return values in [0, 1)', () => {
      const rng = new DeterministicRandom(1)
      for (let i = 0; i < 100; i++) {
        const value = rng.nextDouble()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }
    })

    it('should produce a deterministic sequence for a given seed', () => {
      const rng1 = new DeterministicRandom(99999)
      const rng2 = new DeterministicRandom(99999)
      const sequence1 = Array.from({ length: 20 }, () => rng1.nextDouble())
      const sequence2 = Array.from({ length: 20 }, () => rng2.nextDouble())
      expect(sequence1).toEqual(sequence2)
    })

    it('should produce different sequences for different seeds', () => {
      const rng1 = new DeterministicRandom(10)
      const rng2 = new DeterministicRandom(20)
      const sequence1 = Array.from({ length: 10 }, () => rng1.nextDouble())
      const sequence2 = Array.from({ length: 10 }, () => rng2.nextDouble())
      expect(sequence1).not.toEqual(sequence2)
    })

    it('should advance internal state on each call', () => {
      const rng = new DeterministicRandom(42)
      rng.nextDouble()
      const state1 = rng.getState()
      rng.nextDouble()
      const state2 = rng.getState()
      expect(state2).not.toBe(state1)
    })
  })

  describe('getState', () => {
    it('should return the initial state after construction', () => {
      const rng = new DeterministicRandom(777)
      expect(rng.getState()).toBe(777)
    })
  })

  describe('mixed usage', () => {
    it('nextInt and nextDouble should share the same internal state progression', () => {
      const rng1 = new DeterministicRandom(42)
      const rng2 = new DeterministicRandom(42)

      // rng1: call nextInt then nextDouble
      const i1 = rng1.nextInt(10)
      const d1 = rng1.nextDouble()

      // rng2: same seed, same order
      const i2 = rng2.nextInt(10)
      const d2 = rng2.nextDouble()

      expect(i1).toBe(i2)
      expect(d1).toBe(d2)
    })

    it('should be fully reproducible from a seed', () => {
      const seed = 54321
      const rng1 = new DeterministicRandom(seed)
      const rng2 = new DeterministicRandom(seed)

      const actions = [
        () => rng1.nextInt(4),
        () => rng1.nextDouble(),
        () => rng1.nextInt(16),
        () => rng1.nextInt(2),
        () => rng1.nextDouble(),
      ]
      const expected = [
        rng2.nextInt(4),
        rng2.nextDouble(),
        rng2.nextInt(16),
        rng2.nextInt(2),
        rng2.nextDouble(),
      ]

      const results = actions.map(fn => fn())
      expect(results).toEqual(expected)
    })
  })
})
