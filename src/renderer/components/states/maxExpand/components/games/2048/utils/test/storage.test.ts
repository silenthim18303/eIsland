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
 * @file storage.test.ts
 * @description 2048 本地存档读写工具单元测试
 * @author 鸡哥
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { STORAGE_KEY } from '../../config/constants'
import type { SavedState } from '../../config/types'

// Provide a real in-memory localStorage since the test environment is node (no jsdom)
const store = new Map<string, string>()

const mockLocalStorage: Storage = {
  get length() { return store.size },
  clear() { store.clear() },
  getItem(key: string) { return store.has(key) ? store.get(key)! : null },
  setItem(key: string, value: string) { store.set(key, String(value)) },
  removeItem(key: string) { store.delete(key) },
  key(index: number) { return [...store.keys()][index] ?? null },
}

vi.stubGlobal('localStorage', mockLocalStorage)

// Dynamic import after global stub so the module sees the mock
// (the module reads localStorage at call time, not import time, so a regular import is sufficient)
const { saveState, loadState, clearState } = await import('../storage')

const validState: SavedState = {
  tiles: [
    { id: 1, value: 2, row: 0, col: 0 },
    { id: 2, value: 4, row: 1, col: 2 },
  ],
  score: 100,
  best: 500,
  moveCount: 10,
  startTime: 1700000000000,
  tileSeq: 3,
  moveTrace: 'u,d,l,r',
  randomState: 42,
}

beforeEach(() => {
  store.clear()
})

describe('saveState', () => {
  it('should save valid state to localStorage as JSON', () => {
    saveState(validState)
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBe(JSON.stringify(validState))
  })

  it('should overwrite previous state on repeated calls', () => {
    saveState(validState)
    const updated: SavedState = { ...validState, score: 999 }
    saveState(updated)
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(JSON.parse(raw!).score).toBe(999)
  })

  it('should handle empty tiles array', () => {
    const state: SavedState = { ...validState, tiles: [] }
    saveState(state)
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(JSON.parse(raw!).tiles).toEqual([])
  })

  it('should silently ignore errors from localStorage.setItem', () => {
    const spy = vi.spyOn(mockLocalStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    expect(() => saveState(validState)).not.toThrow()
    spy.mockRestore()
  })
})

describe('loadState', () => {
  it('should return the saved state when data is valid', () => {
    saveState(validState)
    const result = loadState()
    expect(result).toEqual(validState)
  })

  it('should return null when no data exists in localStorage', () => {
    expect(loadState()).toBeNull()
  })

  it('should return null when stored value is empty string', () => {
    store.set(STORAGE_KEY, '')
    expect(loadState()).toBeNull()
  })

  it('should return null when stored JSON is malformed', () => {
    store.set(STORAGE_KEY, '{invalid json')
    expect(loadState()).toBeNull()
  })

  it('should return null when tiles is not an array', () => {
    store.set(STORAGE_KEY, JSON.stringify({
      ...validState,
      tiles: 'not-an-array',
    }))
    expect(loadState()).toBeNull()
  })

  it('should return null when tiles is missing', () => {
    store.set(STORAGE_KEY, JSON.stringify({
      score: 100,
      best: 500,
      moveCount: 10,
      startTime: 1700000000000,
      tileSeq: 3,
      moveTrace: '',
      randomState: 42,
    }))
    expect(loadState()).toBeNull()
  })

  it('should return null when score is not a number', () => {
    store.set(STORAGE_KEY, JSON.stringify({
      ...validState,
      score: '100',
    }))
    expect(loadState()).toBeNull()
  })

  it('should return null when best is not a number', () => {
    store.set(STORAGE_KEY, JSON.stringify({
      ...validState,
      best: null,
    }))
    expect(loadState()).toBeNull()
  })

  it('should return null when moveCount is not a number', () => {
    store.set(STORAGE_KEY, JSON.stringify({
      ...validState,
      moveCount: undefined,
    }))
    expect(loadState()).toBeNull()
  })

  it('should return null when startTime is not a number', () => {
    store.set(STORAGE_KEY, JSON.stringify({
      ...validState,
      startTime: false,
    }))
    expect(loadState()).toBeNull()
  })

  it('should return null when tileSeq is not a number', () => {
    store.set(STORAGE_KEY, JSON.stringify({
      ...validState,
      tileSeq: [1],
    }))
    expect(loadState()).toBeNull()
  })

  it('should return null when randomState is not a number', () => {
    store.set(STORAGE_KEY, JSON.stringify({
      ...validState,
      randomState: '42',
    }))
    expect(loadState()).toBeNull()
  })

  it('should accept zero values for numeric fields', () => {
    const zeroState: SavedState = {
      tiles: [],
      score: 0,
      best: 0,
      moveCount: 0,
      startTime: 0,
      tileSeq: 0,
      moveTrace: '',
      randomState: 0,
    }
    store.set(STORAGE_KEY, JSON.stringify(zeroState))
    expect(loadState()).toEqual(zeroState)
  })

  it('should accept negative numeric values', () => {
    const negativeState: SavedState = {
      ...validState,
      score: -1,
      best: -100,
      moveCount: -5,
      startTime: -1,
      tileSeq: -1,
      randomState: -1,
    }
    store.set(STORAGE_KEY, JSON.stringify(negativeState))
    expect(loadState()).toEqual(negativeState)
  })

  it('should silently return null when localStorage.getItem throws', () => {
    const spy = vi.spyOn(mockLocalStorage, 'getItem').mockImplementation(() => {
      throw new Error('security error')
    })
    expect(loadState()).toBeNull()
    spy.mockRestore()
  })

  it('should return data when moveTrace is missing but all validated fields are present', () => {
    const partial = {
      tiles: [],
      score: 0,
      best: 0,
      moveCount: 0,
      startTime: 0,
      tileSeq: 0,
      randomState: 0,
    }
    store.set(STORAGE_KEY, JSON.stringify(partial))
    expect(loadState()).toEqual(partial)
  })
})

describe('clearState', () => {
  it('should remove the stored state from localStorage', () => {
    saveState(validState)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    clearState()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('should be a no-op when no state exists', () => {
    expect(() => clearState()).not.toThrow()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('should silently ignore errors from localStorage.removeItem', () => {
    const spy = vi.spyOn(mockLocalStorage, 'removeItem').mockImplementation(() => {
      throw new Error('security error')
    })
    expect(() => clearState()).not.toThrow()
    spy.mockRestore()
  })
})

describe('saveState + loadState round-trip', () => {
  it('should survive a full save and load cycle', () => {
    saveState(validState)
    const loaded = loadState()
    expect(loaded).toEqual(validState)
  })

  it('should preserve tile data faithfully', () => {
    const tiles = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      value: 2 ** (i + 1),
      row: Math.floor(i / 4),
      col: i % 4,
    }))
    const state: SavedState = { ...validState, tiles }
    saveState(state)
    expect(loadState()!.tiles).toEqual(tiles)
  })

  it('clearState should make loadState return null', () => {
    saveState(validState)
    clearState()
    expect(loadState()).toBeNull()
  })
})
