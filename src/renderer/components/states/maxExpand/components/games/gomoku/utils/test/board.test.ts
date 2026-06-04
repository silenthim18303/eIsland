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
 * @description 五子棋棋盘工具单元测试
 * @author 鸡哥
 */

import { describe, it, expect } from 'vitest'
import { createGomokuBoard, isGomokuWin } from '../board'
import { GOMOKU_SIZE } from '../../config/types'

describe('createGomokuBoard', () => {
  it('should return a 2D array with GOMOKU_SIZE rows', () => {
    const board = createGomokuBoard()
    expect(board).toHaveLength(GOMOKU_SIZE)
  })

  it('should have GOMOKU_SIZE columns in each row', () => {
    const board = createGomokuBoard()
    board.forEach((row) => {
      expect(row).toHaveLength(GOMOKU_SIZE)
    })
  })

  it('should initialize every cell to 0', () => {
    const board = createGomokuBoard()
    for (let r = 0; r < GOMOKU_SIZE; r++) {
      for (let c = 0; c < GOMOKU_SIZE; c++) {
        expect(board[r][c]).toBe(0)
      }
    }
  })

  it('should return independent rows (no shared references)', () => {
    const board = createGomokuBoard()
    board[0][0] = 1
    expect(board[1][0]).toBe(0)
  })
})

describe('isGomokuWin', () => {
  /** Helper: create an empty board and place a line of pieces. */
  function makeBoardWithLine(
    startRow: number,
    startCol: number,
    dx: number,
    dy: number,
    piece: 1 | 2,
    length: number,
  ): number[][] {
    const board = createGomokuBoard()
    for (let i = 0; i < length; i++) {
      board[startRow + dx * i][startCol + dy * i] = piece
    }
    return board
  }

  describe('horizontal win (dx=0, dy=1)', () => {
    it('should detect five in a row horizontally at top-left corner', () => {
      const board = makeBoardWithLine(0, 0, 0, 1, 1, 5)
      expect(isGomokuWin(board, 0, 2, 1)).toBe(true)
    })

    it('should detect five in a row horizontally at bottom-right area', () => {
      const board = makeBoardWithLine(14, 10, 0, 1, 2, 5)
      expect(isGomokuWin(board, 14, 12, 2)).toBe(true)
    })

    it('should detect when the checked cell is at the start of the five', () => {
      const board = makeBoardWithLine(7, 3, 0, 1, 1, 5)
      expect(isGomokuWin(board, 7, 3, 1)).toBe(true)
    })

    it('should detect when the checked cell is at the end of the five', () => {
      const board = makeBoardWithLine(7, 3, 0, 1, 1, 5)
      expect(isGomokuWin(board, 7, 7, 1)).toBe(true)
    })
  })

  describe('vertical win (dx=1, dy=0)', () => {
    it('should detect five in a row vertically', () => {
      const board = makeBoardWithLine(2, 5, 1, 0, 1, 5)
      expect(isGomokuWin(board, 4, 5, 1)).toBe(true)
    })

    it('should detect five in a row vertically starting at row 0', () => {
      const board = makeBoardWithLine(0, 7, 1, 0, 2, 5)
      expect(isGomokuWin(board, 0, 7, 2)).toBe(true)
    })

    it('should detect five in a row vertically ending at row 14', () => {
      const board = makeBoardWithLine(10, 7, 1, 0, 2, 5)
      expect(isGomokuWin(board, 14, 7, 2)).toBe(true)
    })
  })

  describe('diagonal down-right win (dx=1, dy=1)', () => {
    it('should detect five in a row diagonally (top-left to bottom-right)', () => {
      const board = makeBoardWithLine(3, 3, 1, 1, 1, 5)
      expect(isGomokuWin(board, 5, 5, 1)).toBe(true)
    })

    it('should detect five in a row diagonally starting at (0,0)', () => {
      const board = makeBoardWithLine(0, 0, 1, 1, 2, 5)
      expect(isGomokuWin(board, 0, 0, 2)).toBe(true)
    })

    it('should detect five in a row diagonally ending at (14,14)', () => {
      const board = makeBoardWithLine(10, 10, 1, 1, 1, 5)
      expect(isGomokuWin(board, 14, 14, 1)).toBe(true)
    })
  })

  describe('diagonal down-left win (dx=1, dy=-1)', () => {
    it('should detect five in a row diagonally (top-right to bottom-left)', () => {
      const board = createGomokuBoard()
      // Place pieces at (0,14), (1,13), (2,12), (3,11), (4,10)
      for (let i = 0; i < 5; i++) {
        board[i][14 - i] = 1
      }
      expect(isGomokuWin(board, 2, 12, 1)).toBe(true)
    })

    it('should detect five ending at bottom-left corner', () => {
      const board = createGomokuBoard()
      for (let i = 0; i < 5; i++) {
        board[10 + i][4 - i] = 2
      }
      expect(isGomokuWin(board, 14, 0, 2)).toBe(true)
    })
  })

  describe('no win scenarios', () => {
    it('should return false on an empty board', () => {
      const board = createGomokuBoard()
      expect(isGomokuWin(board, 7, 7, 1)).toBe(false)
    })

    it('should return false when only four in a row', () => {
      const board = makeBoardWithLine(7, 0, 0, 1, 1, 4)
      expect(isGomokuWin(board, 7, 2, 1)).toBe(false)
    })

    it('should return false when four in a row with a gap', () => {
      const board = createGomokuBoard()
      board[7][0] = 1
      board[7][1] = 1
      board[7][2] = 1
      board[7][3] = 1
      // skip [7][4]
      board[7][5] = 1
      expect(isGomokuWin(board, 7, 2, 1)).toBe(false)
    })

    it('should return false when opponent piece breaks the line', () => {
      const board = createGomokuBoard()
      board[7][0] = 1
      board[7][1] = 1
      board[7][2] = 2 // opponent
      board[7][3] = 1
      board[7][4] = 1
      board[7][5] = 1
      expect(isGomokuWin(board, 7, 0, 1)).toBe(false)
    })

    it('should return false for the wrong piece value', () => {
      const board = makeBoardWithLine(7, 0, 0, 1, 1, 5)
      // Check for piece 2, but all cells are 1
      expect(isGomokuWin(board, 7, 2, 2)).toBe(false)
    })
  })

  describe('more than five in a row', () => {
    it('should return true when six consecutive pieces exist', () => {
      const board = makeBoardWithLine(7, 0, 0, 1, 1, 6)
      expect(isGomokuWin(board, 7, 3, 1)).toBe(true)
    })

    it('should return true when seven consecutive pieces exist', () => {
      const board = makeBoardWithLine(7, 0, 0, 1, 1, 7)
      expect(isGomokuWin(board, 7, 0, 1)).toBe(true)
    })
  })

  describe('boundary conditions', () => {
    it('should handle a piece at (0,0) without going out of bounds', () => {
      const board = createGomokuBoard()
      board[0][0] = 1
      expect(isGomokuWin(board, 0, 0, 1)).toBe(false)
    })

    it('should handle a piece at (14,14) without going out of bounds', () => {
      const board = createGomokuBoard()
      board[14][14] = 1
      expect(isGomokuWin(board, 14, 14, 1)).toBe(false)
    })

    it('should not count pieces wrapping from one edge to another', () => {
      // Place 3 pieces at end of row and 2 at the start — should not connect
      const board = createGomokuBoard()
      board[7][13] = 1
      board[7][14] = 1
      board[7][0] = 1
      board[7][1] = 1
      board[7][2] = 1
      // Checking (7,14) — the line going right would hit boundary, left goes to 13 then breaks
      expect(isGomokuWin(board, 7, 14, 1)).toBe(false)
    })

    it('should return false when five in a row exists but checked cell is not part of it', () => {
      const board = makeBoardWithLine(7, 0, 0, 1, 1, 5)
      // Place a separate piece away from the line
      board[7][8] = 1
      expect(isGomokuWin(board, 7, 8, 1)).toBe(false)
    })
  })

  describe('both players', () => {
    it('should detect a win for player 1', () => {
      const board = makeBoardWithLine(5, 5, 0, 1, 1, 5)
      expect(isGomokuWin(board, 5, 7, 1)).toBe(true)
    })

    it('should detect a win for player 2', () => {
      const board = makeBoardWithLine(5, 5, 0, 1, 2, 5)
      expect(isGomokuWin(board, 5, 7, 2)).toBe(true)
    })

    it('should not falsely detect player 2 win when pieces belong to player 1', () => {
      const board = makeBoardWithLine(5, 5, 0, 1, 1, 5)
      expect(isGomokuWin(board, 5, 7, 2)).toBe(false)
    })
  })
})
