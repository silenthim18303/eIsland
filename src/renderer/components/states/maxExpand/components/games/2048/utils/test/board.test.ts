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
 * @file board.test.ts
 * @description 2048 棋盘核心计算逻辑单元测试
 * @author 鸡哥
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TileData, SavedState } from '../../config/types'

const { loadStateMock } = vi.hoisted(() => ({
  loadStateMock: vi.fn<() => SavedState | null>(),
}))

vi.mock('../storage', () => ({
  loadState: loadStateMock,
}))

import {
  getTileSeq,
  setTileSeq,
  spawn,
  computeMove,
  canMove,
  initTiles,
  createInitial,
} from '../board'
import { DeterministicRandom } from '../random'

beforeEach(() => {
  setTileSeq(1)
})

/* ------------------------------------------------------------------ */
/*  getTileSeq / setTileSeq                                           */
/* ------------------------------------------------------------------ */

describe('getTileSeq / setTileSeq', () => {
  it('should return the initial value of 1', () => {
    expect(getTileSeq()).toBe(1)
  })

  it('setTileSeq should update the value returned by getTileSeq', () => {
    setTileSeq(42)
    expect(getTileSeq()).toBe(42)
  })

  it('setTileSeq should accept zero', () => {
    setTileSeq(0)
    expect(getTileSeq()).toBe(0)
  })
})

/* ------------------------------------------------------------------ */
/*  spawn                                                             */
/* ------------------------------------------------------------------ */

describe('spawn', () => {
  it('should spawn a tile at an empty position', () => {
    const mockRandom = {
      nextInt: vi.fn().mockReturnValue(0),
      nextDouble: vi.fn().mockReturnValue(0.5),
    } as unknown as DeterministicRandom

    const result = spawn([], mockRandom)

    expect(result).not.toBeNull()
    expect(result!.row).toBe(0)
    expect(result!.col).toBe(0)
    expect(result!.value).toBe(2)
    expect(result!.id).toBe(1)
  })

  it('should spawn a tile with value 4 when random double >= 0.9', () => {
    const mockRandom = {
      nextInt: vi.fn().mockReturnValue(0),
      nextDouble: vi.fn().mockReturnValue(0.95),
    } as unknown as DeterministicRandom

    const result = spawn([], mockRandom)

    expect(result).not.toBeNull()
    expect(result!.value).toBe(4)
  })

  it('should spawn a tile with value 2 when random double is exactly 0.9', () => {
    const mockRandom = {
      nextInt: vi.fn().mockReturnValue(0),
      nextDouble: vi.fn().mockReturnValue(0.89),
    } as unknown as DeterministicRandom

    const result = spawn([], mockRandom)

    expect(result!.value).toBe(2)
  })

  it('should return null when the board is full', () => {
    const fullBoard: TileData[] = []
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        fullBoard.push({ id: r * 4 + c + 1, value: 2, row: r, col: c })
      }
    }

    const mockRandom = {
      nextInt: vi.fn(),
      nextDouble: vi.fn(),
    } as unknown as DeterministicRandom

    const result = spawn(fullBoard, mockRandom)

    expect(result).toBeNull()
    expect(mockRandom.nextInt).not.toHaveBeenCalled()
    expect(mockRandom.nextDouble).not.toHaveBeenCalled()
  })

  it('should increment tileSeq after spawning', () => {
    setTileSeq(10)
    const mockRandom = {
      nextInt: vi.fn().mockReturnValue(0),
      nextDouble: vi.fn().mockReturnValue(0.5),
    } as unknown as DeterministicRandom

    spawn([], mockRandom)

    expect(getTileSeq()).toBe(11)
  })

  it('should select from available empty positions only', () => {
    const existing: TileData[] = [
      { id: 1, value: 2, row: 0, col: 0 },
      { id: 2, value: 2, row: 0, col: 1 },
      { id: 3, value: 2, row: 0, col: 2 },
      { id: 4, value: 2, row: 0, col: 3 },
      { id: 5, value: 2, row: 1, col: 0 },
      { id: 6, value: 2, row: 1, col: 1 },
      { id: 7, value: 2, row: 1, col: 2 },
      { id: 8, value: 2, row: 1, col: 3 },
      { id: 9, value: 2, row: 2, col: 0 },
      { id: 10, value: 2, row: 2, col: 1 },
      { id: 11, value: 2, row: 2, col: 2 },
      { id: 12, value: 2, row: 2, col: 3 },
      { id: 13, value: 2, row: 3, col: 0 },
      { id: 14, value: 2, row: 3, col: 1 },
      { id: 15, value: 2, row: 3, col: 2 },
    ]

    const mockRandom = {
      nextInt: vi.fn().mockReturnValue(0),
      nextDouble: vi.fn().mockReturnValue(0.5),
    } as unknown as DeterministicRandom

    const result = spawn(existing, mockRandom)

    expect(result).not.toBeNull()
    expect(result!.row).toBe(3)
    expect(result!.col).toBe(3)
    expect(mockRandom.nextInt).toHaveBeenCalledWith(1)
  })
})

/* ------------------------------------------------------------------ */
/*  computeMove                                                       */
/* ------------------------------------------------------------------ */

describe('computeMove', () => {
  describe('left', () => {
    it('should slide a single tile to the left edge', () => {
      const tiles: TileData[] = [{ id: 1, value: 2, row: 0, col: 3 }]

      const result = computeMove(tiles, 'left')

      expect(result.tiles[0].col).toBe(0)
      expect(result.tiles[0].row).toBe(0)
      expect(result.moved).toBe(true)
      expect(result.merges).toHaveLength(0)
      expect(result.scoreGained).toBe(0)
    })

    it('should not move tiles already at the left edge', () => {
      const tiles: TileData[] = [{ id: 1, value: 2, row: 0, col: 0 }]

      const result = computeMove(tiles, 'left')

      expect(result.tiles[0].col).toBe(0)
      expect(result.moved).toBe(false)
    })

    it('should merge two equal tiles moving left', () => {
      const tiles: TileData[] = [
        { id: 1, value: 2, row: 0, col: 1 },
        { id: 2, value: 2, row: 0, col: 3 },
      ]

      const result = computeMove(tiles, 'left')

      expect(result.tiles).toHaveLength(2)
      expect(result.tiles[0].col).toBe(0)
      expect(result.tiles[1].col).toBe(0)
      expect(result.merges).toHaveLength(1)
      expect(result.merges[0].survivorId).toBe(1)
      expect(result.merges[0].absorbedId).toBe(2)
      expect(result.merges[0].newValue).toBe(4)
      expect(result.scoreGained).toBe(4)
      expect(result.moved).toBe(true)
    })

    it('should not merge unequal tiles', () => {
      const tiles: TileData[] = [
        { id: 1, value: 2, row: 0, col: 1 },
        { id: 2, value: 4, row: 0, col: 3 },
      ]

      const result = computeMove(tiles, 'left')

      expect(result.merges).toHaveLength(0)
      expect(result.tiles[0].col).toBe(0)
      expect(result.tiles[1].col).toBe(1)
      expect(result.scoreGained).toBe(0)
    })
  })

  describe('right', () => {
    it('should slide a single tile to the right edge', () => {
      const tiles: TileData[] = [{ id: 1, value: 2, row: 0, col: 0 }]

      const result = computeMove(tiles, 'right')

      expect(result.tiles[0].col).toBe(3)
      expect(result.moved).toBe(true)
    })

    it('should merge two equal tiles moving right', () => {
      const tiles: TileData[] = [
        { id: 1, value: 4, row: 0, col: 0 },
        { id: 2, value: 4, row: 0, col: 2 },
      ]

      const result = computeMove(tiles, 'right')

      expect(result.tiles).toHaveLength(2)
      expect(result.tiles[0].col).toBe(3)
      expect(result.tiles[1].col).toBe(3)
      expect(result.merges).toHaveLength(1)
      expect(result.merges[0].newValue).toBe(8)
      expect(result.scoreGained).toBe(8)
    })
  })

  describe('up', () => {
    it('should slide a single tile to the top edge', () => {
      const tiles: TileData[] = [{ id: 1, value: 2, row: 3, col: 0 }]

      const result = computeMove(tiles, 'up')

      expect(result.tiles[0].row).toBe(0)
      expect(result.moved).toBe(true)
    })

    it('should merge two equal tiles moving up', () => {
      const tiles: TileData[] = [
        { id: 1, value: 8, row: 1, col: 0 },
        { id: 2, value: 8, row: 3, col: 0 },
      ]

      const result = computeMove(tiles, 'up')

      expect(result.tiles).toHaveLength(2)
      expect(result.tiles[0].row).toBe(0)
      expect(result.tiles[1].row).toBe(0)
      expect(result.merges).toHaveLength(1)
      expect(result.merges[0].newValue).toBe(16)
      expect(result.scoreGained).toBe(16)
    })
  })

  describe('down', () => {
    it('should slide a single tile to the bottom edge', () => {
      const tiles: TileData[] = [{ id: 1, value: 2, row: 0, col: 0 }]

      const result = computeMove(tiles, 'down')

      expect(result.tiles[0].row).toBe(3)
      expect(result.moved).toBe(true)
    })

    it('should merge two equal tiles moving down', () => {
      const tiles: TileData[] = [
        { id: 1, value: 2, row: 0, col: 2 },
        { id: 2, value: 2, row: 2, col: 2 },
      ]

      const result = computeMove(tiles, 'down')

      expect(result.tiles).toHaveLength(2)
      expect(result.tiles[0].row).toBe(3)
      expect(result.tiles[1].row).toBe(3)
      expect(result.merges).toHaveLength(1)
      expect(result.merges[0].newValue).toBe(4)
      expect(result.scoreGained).toBe(4)
    })
  })

  describe('multi-tile scenarios', () => {
    it('should handle multiple merges in one row', () => {
      const tiles: TileData[] = [
        { id: 1, value: 2, row: 0, col: 0 },
        { id: 2, value: 2, row: 0, col: 1 },
        { id: 3, value: 4, row: 0, col: 2 },
        { id: 4, value: 4, row: 0, col: 3 },
      ]

      const result = computeMove(tiles, 'left')

      expect(result.tiles).toHaveLength(4)
      expect(result.merges).toHaveLength(2)
      expect(result.scoreGained).toBe(12)
      expect(result.tiles[0].col).toBe(0)
      expect(result.tiles[1].col).toBe(0)
      expect(result.tiles[2].col).toBe(1)
      expect(result.tiles[3].col).toBe(1)
    })

    it('should handle three equal tiles: merge first two, third stays separate', () => {
      const tiles: TileData[] = [
        { id: 1, value: 2, row: 0, col: 0 },
        { id: 2, value: 2, row: 0, col: 1 },
        { id: 3, value: 2, row: 0, col: 2 },
      ]

      const result = computeMove(tiles, 'left')

      expect(result.tiles).toHaveLength(3)
      expect(result.merges).toHaveLength(1)
      expect(result.merges[0].survivorId).toBe(1)
      expect(result.merges[0].absorbedId).toBe(2)
      expect(result.merges[0].newValue).toBe(4)
      expect(result.tiles[0].col).toBe(0)
      expect(result.tiles[1].col).toBe(0)
      expect(result.tiles[2].col).toBe(1)
    })

    it('should handle tiles in different rows independently', () => {
      const tiles: TileData[] = [
        { id: 1, value: 2, row: 0, col: 2 },
        { id: 2, value: 4, row: 1, col: 3 },
      ]

      const result = computeMove(tiles, 'left')

      expect(result.tiles).toHaveLength(2)
      const t1 = result.tiles.find((t) => t.id === 1)!
      const t2 = result.tiles.find((t) => t.id === 2)!
      expect(t1.col).toBe(0)
      expect(t1.row).toBe(0)
      expect(t2.col).toBe(0)
      expect(t2.row).toBe(1)
      expect(result.moved).toBe(true)
    })

    it('should handle empty tiles array', () => {
      const result = computeMove([], 'left')

      expect(result.tiles).toHaveLength(0)
      expect(result.merges).toHaveLength(0)
      expect(result.scoreGained).toBe(0)
      expect(result.moved).toBe(false)
    })

    it('should handle a full row that cannot move left', () => {
      const tiles: TileData[] = [
        { id: 1, value: 2, row: 0, col: 0 },
        { id: 2, value: 4, row: 0, col: 1 },
        { id: 3, value: 8, row: 0, col: 2 },
        { id: 4, value: 16, row: 0, col: 3 },
      ]

      const result = computeMove(tiles, 'left')

      expect(result.moved).toBe(false)
      expect(result.merges).toHaveLength(0)
      expect(result.scoreGained).toBe(0)
    })

    it('should handle four equal tiles: two merges', () => {
      const tiles: TileData[] = [
        { id: 1, value: 2, row: 0, col: 0 },
        { id: 2, value: 2, row: 0, col: 1 },
        { id: 3, value: 2, row: 0, col: 2 },
        { id: 4, value: 2, row: 0, col: 3 },
      ]

      const result = computeMove(tiles, 'left')

      expect(result.tiles).toHaveLength(4)
      expect(result.merges).toHaveLength(2)
      expect(result.scoreGained).toBe(8)
      expect(result.tiles[0].col).toBe(0)
      expect(result.tiles[1].col).toBe(0)
      expect(result.tiles[2].col).toBe(1)
      expect(result.tiles[3].col).toBe(1)
    })

    it('should not mutate the original tiles array', () => {
      const tiles: TileData[] = [{ id: 1, value: 2, row: 0, col: 3 }]
      const originalCol = tiles[0].col

      computeMove(tiles, 'left')

      expect(tiles[0].col).toBe(originalCol)
    })
  })
})

/* ------------------------------------------------------------------ */
/*  canMove                                                           */
/* ------------------------------------------------------------------ */

describe('canMove', () => {
  it('should return true when tiles can slide', () => {
    const tiles: TileData[] = [{ id: 1, value: 2, row: 0, col: 1 }]

    expect(canMove(tiles)).toBe(true)
  })

  it('should return true when tiles can merge', () => {
    const tiles: TileData[] = [
      { id: 1, value: 2, row: 0, col: 0 },
      { id: 2, value: 2, row: 0, col: 1 },
    ]

    expect(canMove(tiles)).toBe(true)
  })

  it('should return false when no moves are possible', () => {
    const tiles: TileData[] = []
    let id = 1
    const values = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4096],
      [8192, 16384, 32768, 65536],
    ]
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        tiles.push({ id: id++, value: values[r][c], row: r, col: c })
      }
    }

    expect(canMove(tiles)).toBe(false)
  })

  it('should return false for an empty board', () => {
    expect(canMove([])).toBe(false)
  })

  it('should return true for a single tile not at edge', () => {
    const tiles: TileData[] = [{ id: 1, value: 2, row: 2, col: 2 }]

    expect(canMove(tiles)).toBe(true)
  })

  it('should return true for a single tile at a corner (can slide along other axis)', () => {
    const tiles: TileData[] = [{ id: 1, value: 2, row: 0, col: 0 }]

    expect(canMove(tiles)).toBe(true)
  })

  it('should return true when vertical merge is possible', () => {
    const tiles: TileData[] = [
      { id: 1, value: 2, row: 0, col: 0 },
      { id: 2, value: 2, row: 2, col: 0 },
    ]

    expect(canMove(tiles)).toBe(true)
  })
})

/* ------------------------------------------------------------------ */
/*  initTiles                                                         */
/* ------------------------------------------------------------------ */

describe('initTiles', () => {
  it('should return exactly 2 tiles', () => {
    const random = new DeterministicRandom(1)
    const tiles = initTiles(random)

    expect(tiles).toHaveLength(2)
  })

  it('should reset tileSeq to 1 before spawning', () => {
    setTileSeq(99)
    const random = new DeterministicRandom(1)
    const tiles = initTiles(random)

    expect(tiles[0].id).toBe(1)
  })

  it('should produce tiles with sequential ids', () => {
    const random = new DeterministicRandom(1)
    const tiles = initTiles(random)

    expect(tiles[0].id).toBe(1)
    expect(tiles[1].id).toBe(2)
  })

  it('should produce deterministic results for the same seed', () => {
    const random1 = new DeterministicRandom(42)
    const random2 = new DeterministicRandom(42)
    const tiles1 = initTiles(random1)
    setTileSeq(1)
    const tiles2 = initTiles(random2)

    expect(tiles1).toEqual(tiles2)
  })

  it('should place tiles at different positions', () => {
    const random = new DeterministicRandom(1)
    const tiles = initTiles(random)

    const samePosition = tiles[0].row === tiles[1].row && tiles[0].col === tiles[1].col
    expect(samePosition).toBe(false)
  })

  it('should set tileSeq to 3 after creating 2 tiles', () => {
    const random = new DeterministicRandom(1)
    initTiles(random)

    expect(getTileSeq()).toBe(3)
  })
})

/* ------------------------------------------------------------------ */
/*  createInitial                                                     */
/* ------------------------------------------------------------------ */

describe('createInitial', () => {
  it('should return saved state when loadState returns data', () => {
    const savedState: SavedState = {
      tiles: [
        { id: 5, value: 2, row: 0, col: 0 },
        { id: 6, value: 4, row: 1, col: 2 },
      ],
      score: 100,
      best: 500,
      moveCount: 10,
      startTime: 1700000000000,
      tileSeq: 7,
      moveTrace: 'u,d,l,r',
      randomState: 42,
    }
    loadStateMock.mockReturnValue(savedState)

    const result = createInitial()

    expect(result.tiles).toEqual(savedState.tiles)
    expect(result.score).toBe(100)
    expect(result.best).toBe(500)
    expect(result.moveCount).toBe(10)
    expect(result.startTime).toBe(1700000000000)
    expect(result.moveTrace).toBe('u,d,l,r')
    expect(result.randomState).toBe(42)
    expect(getTileSeq()).toBe(7)
  })

  it('should default moveTrace to empty string when saved state has no moveTrace', () => {
    const savedState: SavedState = {
      tiles: [{ id: 1, value: 2, row: 0, col: 0 }],
      score: 0,
      best: 0,
      moveCount: 0,
      startTime: 100,
      tileSeq: 2,
      moveTrace: '',
      randomState: 0,
    }
    loadStateMock.mockReturnValue(savedState)

    const result = createInitial()

    expect(result.moveTrace).toBe('')
  })

  it('should mask randomState to unsigned 32-bit integer', () => {
    const savedState: SavedState = {
      tiles: [],
      score: 0,
      best: 0,
      moveCount: 0,
      startTime: 0,
      tileSeq: 1,
      moveTrace: '',
      randomState: -1,
    }
    loadStateMock.mockReturnValue(savedState)

    const result = createInitial()

    expect(result.randomState).toBe(-1 >>> 0)
  })

  it('should create fresh state when loadState returns null', () => {
    loadStateMock.mockReturnValue(null)

    const result = createInitial()

    expect(result.tiles).toHaveLength(2)
    expect(result.score).toBe(0)
    expect(result.best).toBe(0)
    expect(result.moveCount).toBe(0)
    expect(result.startTime).toBe(0)
    expect(result.moveTrace).toBe('')
    expect(result.randomState).toBeGreaterThan(0)
    expect(getTileSeq()).toBe(3)
  })

  it('should use seed 1 for the fresh state random', () => {
    loadStateMock.mockReturnValue(null)

    const result1 = createInitial()
    setTileSeq(1)
    const result2 = createInitial()

    expect(result1.tiles).toEqual(result2.tiles)
    expect(result1.randomState).toBe(result2.randomState)
  })

  it('should call loadState exactly once', () => {
    loadStateMock.mockReturnValue(null)

    createInitial()

    expect(loadStateMock).toHaveBeenCalledTimes(1)
  })
})
