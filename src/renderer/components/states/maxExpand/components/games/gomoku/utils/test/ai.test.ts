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
 * @file ai.test.ts
 * @description 五子棋 AI 选点策略单元测试
 * @author 鸡哥
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { isGomokuWinMock } = vi.hoisted(() => ({
  isGomokuWinMock: vi.fn(),
}));

vi.mock('../board', () => ({
  isGomokuWin: isGomokuWinMock,
}));

vi.mock('../../config/types', () => ({
  GOMOKU_SIZE: 15,
}));

import { selectGomokuAIMove } from '../ai';

/** Create a clean 15x15 empty board. */
function createEmptyBoard(): number[][] {
  return Array.from({ length: 15 }, () => Array(15).fill(0));
}

/** Real isGomokuWin logic for use as mock implementation. */
function checkWin(board: number[][], row: number, col: number, piece: 1 | 2): boolean {
  const dirs: Array<[number, number]> = [[1, 0], [0, 1], [1, 1], [1, -1]];
  return dirs.some(([dx, dy]) => {
    let count = 1;
    for (let step = 1; step < 5; step += 1) {
      const nr = row + dx * step;
      const nc = col + dy * step;
      if (nr < 0 || nr >= 15 || nc < 0 || nc >= 15 || board[nr][nc] !== piece) break;
      count += 1;
    }
    for (let step = 1; step < 5; step += 1) {
      const nr = row - dx * step;
      const nc = col - dy * step;
      if (nr < 0 || nr >= 15 || nc < 0 || nc >= 15 || board[nr][nc] !== piece) break;
      count += 1;
    }
    return count >= 5;
  });
}

describe('selectGomokuAIMove', () => {
  beforeEach(() => {
    isGomokuWinMock.mockImplementation(checkWin);
  });

  // ---------------------------------------------------------------------------
  // General edge cases
  // ---------------------------------------------------------------------------
  describe('general edge cases', () => {
    it('returns null when board is completely full', () => {
      const fullBoard = Array.from({ length: 15 }, () => Array(15).fill(1));
      expect(selectGomokuAIMove(fullBoard, 'novice', 1)).toBeNull();
    });

    it('returns null for full board regardless of difficulty', () => {
      const fullBoard = Array.from({ length: 15 }, () => Array(15).fill(2));
      const difficulties = ['novice', 'easy', 'hard', 'expert', 'master'] as const;
      difficulties.forEach((diff) => {
        expect(selectGomokuAIMove(fullBoard, diff, 1)).toBeNull();
      });
    });

    it('returns a valid unoccupied position for each difficulty on a mid-game board', () => {
      const difficulties = ['novice', 'easy', 'hard', 'expert', 'master'] as const;
      difficulties.forEach((diff) => {
        const board = createEmptyBoard();
        board[7][7] = 1;
        board[7][8] = 2;
        board[8][7] = 1;
        board[6][8] = 2;
        const move = selectGomokuAIMove(board, diff, 1);
        expect(move).not.toBeNull();
        const [r, c] = move!;
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(15);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThan(15);
        expect(board[r][c]).toBe(0);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Novice (rule-based priority)
  // ---------------------------------------------------------------------------
  describe('novice difficulty', () => {
    it('selects center cell on empty board', () => {
      const board = createEmptyBoard();
      const move = selectGomokuAIMove(board, 'novice', 1);
      expect(move).toEqual([7, 7]);
    });

    it('takes immediate horizontal winning move', () => {
      const board = createEmptyBoard();
      board[7][4] = 1;
      board[7][5] = 1;
      board[7][6] = 1;
      board[7][7] = 1;
      const move = selectGomokuAIMove(board, 'novice', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 1;
      expect(checkWin(board, r, c, 1)).toBe(true);
    });

    it('takes immediate vertical winning move', () => {
      const board = createEmptyBoard();
      board[3][7] = 1;
      board[4][7] = 1;
      board[5][7] = 1;
      board[6][7] = 1;
      const move = selectGomokuAIMove(board, 'novice', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 1;
      expect(checkWin(board, r, c, 1)).toBe(true);
    });

    it('takes immediate diagonal winning move', () => {
      const board = createEmptyBoard();
      board[3][3] = 1;
      board[4][4] = 1;
      board[5][5] = 1;
      board[6][6] = 1;
      const move = selectGomokuAIMove(board, 'novice', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 1;
      expect(checkWin(board, r, c, 1)).toBe(true);
    });

    it('blocks opponent horizontal winning move', () => {
      const board = createEmptyBoard();
      board[7][4] = 2;
      board[7][5] = 2;
      board[7][6] = 2;
      board[7][7] = 2;
      const move = selectGomokuAIMove(board, 'novice', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 2;
      expect(checkWin(board, r, c, 2)).toBe(true);
    });

    it('blocks opponent vertical winning move', () => {
      const board = createEmptyBoard();
      board[3][7] = 2;
      board[4][7] = 2;
      board[5][7] = 2;
      board[6][7] = 2;
      const move = selectGomokuAIMove(board, 'novice', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 2;
      expect(checkWin(board, r, c, 2)).toBe(true);
    });

    it('prefers winning over blocking', () => {
      const board = createEmptyBoard();
      // AI has 4 in a row at row 5
      board[5][3] = 1;
      board[5][4] = 1;
      board[5][5] = 1;
      board[5][6] = 1;
      // Opponent has 4 in a row at row 9
      board[9][3] = 2;
      board[9][4] = 2;
      board[9][5] = 2;
      board[9][6] = 2;

      const move = selectGomokuAIMove(board, 'novice', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      // The returned move should be a winning move for AI
      board[r][c] = 1;
      expect(checkWin(board, r, c, 1)).toBe(true);
    });

    it('picks center-most candidate when no threats', () => {
      const board = createEmptyBoard();
      board[0][0] = 1; // Single piece far from center
      const move = selectGomokuAIMove(board, 'novice', 1);
      expect(move).toEqual([2, 2]); // Closest candidate to center (7,7)
    });
  });

  // ---------------------------------------------------------------------------
  // Easy (scoring-based)
  // ---------------------------------------------------------------------------
  describe('easy difficulty', () => {
    it('returns a valid unoccupied position', () => {
      const board = createEmptyBoard();
      board[7][7] = 1;
      board[7][8] = 2;
      const move = selectGomokuAIMove(board, 'easy', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      expect(board[r][c]).toBe(0);
    });

    it('selects center on empty board', () => {
      const board = createEmptyBoard();
      const move = selectGomokuAIMove(board, 'easy', 1);
      expect(move).toEqual([7, 7]);
    });

    it('prefers positions that extend own line', () => {
      const board = createEmptyBoard();
      board[7][7] = 1;
      board[7][8] = 1;
      board[7][9] = 1;
      const move = selectGomokuAIMove(board, 'easy', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      expect(board[r][c]).toBe(0);
      // Should pick a position on the same row to extend the line
      expect(r).toBe(7);
      expect([6, 10]).toContain(c);
    });
  });

  // ---------------------------------------------------------------------------
  // Hard (negamax alpha-beta, depth 3, 170ms budget)
  // ---------------------------------------------------------------------------
  describe('hard difficulty', () => {
    let mockTime: number;

    beforeEach(() => {
      mockTime = 0;
      vi.spyOn(Date, 'now').mockImplementation(() => {
        mockTime += 50;
        return mockTime;
      });
    });

    it('takes immediate winning move', () => {
      const board = createEmptyBoard();
      board[7][4] = 1;
      board[7][5] = 1;
      board[7][6] = 1;
      board[7][7] = 1;
      const move = selectGomokuAIMove(board, 'hard', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 1;
      expect(checkWin(board, r, c, 1)).toBe(true);
    });

    it('blocks opponent immediate win', () => {
      const board = createEmptyBoard();
      board[7][4] = 2;
      board[7][5] = 2;
      board[7][6] = 2;
      board[7][7] = 2;
      const move = selectGomokuAIMove(board, 'hard', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 2;
      expect(checkWin(board, r, c, 2)).toBe(true);
    });

    it('returns valid position for mid-game board', () => {
      const board = createEmptyBoard();
      board[7][7] = 1;
      board[7][8] = 2;
      board[8][7] = 1;
      board[6][8] = 2;
      const move = selectGomokuAIMove(board, 'hard', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(15);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(15);
      expect(board[r][c]).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Expert (MCTS, 280ms budget)
  // ---------------------------------------------------------------------------
  describe('expert difficulty', () => {
    let mockTime: number;

    beforeEach(() => {
      mockTime = 0;
      vi.spyOn(Date, 'now').mockImplementation(() => {
        mockTime += 50;
        return mockTime;
      });
    });

    it('takes immediate winning move', () => {
      const board = createEmptyBoard();
      board[7][4] = 1;
      board[7][5] = 1;
      board[7][6] = 1;
      board[7][7] = 1;
      const move = selectGomokuAIMove(board, 'expert', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 1;
      expect(checkWin(board, r, c, 1)).toBe(true);
    });

    it('blocks opponent immediate win', () => {
      const board = createEmptyBoard();
      board[7][4] = 2;
      board[7][5] = 2;
      board[7][6] = 2;
      board[7][7] = 2;
      const move = selectGomokuAIMove(board, 'expert', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 2;
      expect(checkWin(board, r, c, 2)).toBe(true);
    });

    it('returns valid position for mid-game board', () => {
      const board = createEmptyBoard();
      board[7][7] = 1;
      board[7][8] = 2;
      board[8][7] = 1;
      board[6][8] = 2;
      board[6][7] = 1;
      const move = selectGomokuAIMove(board, 'expert', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(15);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(15);
      expect(board[r][c]).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Master (negamax + MCTS hybrid, deepest search)
  // ---------------------------------------------------------------------------
  describe('master difficulty', () => {
    let mockTime: number;

    beforeEach(() => {
      mockTime = 0;
      vi.spyOn(Date, 'now').mockImplementation(() => {
        mockTime += 50;
        return mockTime;
      });
    });

    it('takes immediate winning move', () => {
      const board = createEmptyBoard();
      board[7][4] = 1;
      board[7][5] = 1;
      board[7][6] = 1;
      board[7][7] = 1;
      const move = selectGomokuAIMove(board, 'master', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 1;
      expect(checkWin(board, r, c, 1)).toBe(true);
    });

    it('returns valid position for mid-game board', () => {
      const board = createEmptyBoard();
      board[7][7] = 1;
      board[7][8] = 2;
      board[8][7] = 1;
      board[6][8] = 2;
      const move = selectGomokuAIMove(board, 'master', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(15);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(15);
      expect(board[r][c]).toBe(0);
    });

    it('returns a valid move even with tight time budget', () => {
      // Advance time aggressively so algorithms time out quickly
      mockTime = 0;
      vi.spyOn(Date, 'now').mockImplementation(() => {
        mockTime += 200;
        return mockTime;
      });
      const board = createEmptyBoard();
      board[7][7] = 1;
      board[7][8] = 2;
      const move = selectGomokuAIMove(board, 'master', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      expect(board[r][c]).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // aiPiece = 2 (AI plays as second player)
  // ---------------------------------------------------------------------------
  describe('aiPiece = 2', () => {
    it('novice returns valid move when AI is piece 2', () => {
      const board = createEmptyBoard();
      board[7][7] = 1;
      const move = selectGomokuAIMove(board, 'novice', 2);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      expect(board[r][c]).toBe(0);
    });

    it('novice takes winning move when AI is piece 2', () => {
      const board = createEmptyBoard();
      board[7][4] = 2;
      board[7][5] = 2;
      board[7][6] = 2;
      board[7][7] = 2;
      const move = selectGomokuAIMove(board, 'novice', 2);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 2;
      expect(checkWin(board, r, c, 2)).toBe(true);
    });

    it('novice blocks opponent when AI is piece 2', () => {
      const board = createEmptyBoard();
      board[7][4] = 1;
      board[7][5] = 1;
      board[7][6] = 1;
      board[7][7] = 1;
      const move = selectGomokuAIMove(board, 'novice', 2);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      board[r][c] = 1;
      expect(checkWin(board, r, c, 1)).toBe(true);
    });

    it('easy returns valid move when AI is piece 2', () => {
      const board = createEmptyBoard();
      board[7][7] = 1;
      board[6][6] = 1;
      const move = selectGomokuAIMove(board, 'easy', 2);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      expect(board[r][c]).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // isGomokuWin mock verification
  // ---------------------------------------------------------------------------
  describe('isGomokuWin integration', () => {
    it('mock is called during AI decision making', () => {
      const board = createEmptyBoard();
      board[7][7] = 1;
      board[7][8] = 1;
      selectGomokuAIMove(board, 'novice', 1);
      // pickByRulePriority calls isGomokuWin for each candidate to check wins
      expect(isGomokuWinMock).toHaveBeenCalled();
    });

    it('AI still returns valid move when mock returns false for all', () => {
      isGomokuWinMock.mockReturnValue(false);
      const board = createEmptyBoard();
      board[7][7] = 1;
      board[7][8] = 2;
      const move = selectGomokuAIMove(board, 'novice', 1);
      expect(move).not.toBeNull();
      const [r, c] = move!;
      expect(board[r][c]).toBe(0);
    });
  });
});
