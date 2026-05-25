import type { GomokuAIDifficulty } from '../config/types';
import { GOMOKU_SIZE } from '../config/types';
import { isGomokuWin } from './board';

type Piece = 1 | 2;

const DIRECTIONS: Array<[number, number]> = [[1, 0], [0, 1], [1, 1], [1, -1]];

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < GOMOKU_SIZE && col >= 0 && col < GOMOKU_SIZE;
}

function hasNeighbor(board: number[][], row: number, col: number, distance = 2): boolean {
  for (let r = Math.max(0, row - distance); r <= Math.min(GOMOKU_SIZE - 1, row + distance); r += 1) {
    for (let c = Math.max(0, col - distance); c <= Math.min(GOMOKU_SIZE - 1, col + distance); c += 1) {
      if ((r !== row || c !== col) && board[r][c] !== 0) {
        return true;
      }
    }
  }
  return false;
}

function collectCandidateCells(board: number[][]): Array<[number, number]> {
  const used = board.some((row) => row.some((cell) => cell !== 0));
  if (!used) {
    const center = Math.floor(GOMOKU_SIZE / 2);
    return [[center, center]];
  }

  const nearby: Array<[number, number]> = [];
  const fallback: Array<[number, number]> = [];
  for (let row = 0; row < GOMOKU_SIZE; row += 1) {
    for (let col = 0; col < GOMOKU_SIZE; col += 1) {
      if (board[row][col] !== 0) {
        continue;
      }
      fallback.push([row, col]);
      if (hasNeighbor(board, row, col, 2)) {
        nearby.push([row, col]);
      }
    }
  }
  return nearby.length > 0 ? nearby : fallback;
}

function measureLine(board: number[][], row: number, col: number, dx: number, dy: number, piece: Piece): { count: number; open: number } {
  let count = 1;
  let open = 0;

  let nr = row + dx;
  let nc = col + dy;
  while (inBounds(nr, nc) && board[nr][nc] === piece) {
    count += 1;
    nr += dx;
    nc += dy;
  }
  if (inBounds(nr, nc) && board[nr][nc] === 0) {
    open += 1;
  }

  nr = row - dx;
  nc = col - dy;
  while (inBounds(nr, nc) && board[nr][nc] === piece) {
    count += 1;
    nr -= dx;
    nc -= dy;
  }
  if (inBounds(nr, nc) && board[nr][nc] === 0) {
    open += 1;
  }

  return { count, open };
}

function patternScore(count: number, open: number): number {
  if (count >= 5) return 1_000_000;
  if (count === 4 && open === 2) return 120_000;
  if (count === 4 && open === 1) return 18_000;
  if (count === 3 && open === 2) return 5_000;
  if (count === 3 && open === 1) return 900;
  if (count === 2 && open === 2) return 260;
  if (count === 2 && open === 1) return 70;
  if (count === 1 && open === 2) return 20;
  return 1;
}

function evaluatePoint(board: number[][], row: number, col: number, piece: Piece): number {
  let score = 0;
  for (const [dx, dy] of DIRECTIONS) {
    const line = measureLine(board, row, col, dx, dy, piece);
    score += patternScore(line.count, line.open);
  }
  return score;
}

function pickByRulePriority(board: number[][], candidates: Array<[number, number]>, aiPiece: Piece): [number, number] {
  const humanPiece: Piece = aiPiece === 1 ? 2 : 1;

  for (const [row, col] of candidates) {
    const testBoard = board.map((line) => [...line]);
    testBoard[row][col] = aiPiece;
    if (isGomokuWin(testBoard, row, col, aiPiece)) {
      return [row, col];
    }
  }

  for (const [row, col] of candidates) {
    const testBoard = board.map((line) => [...line]);
    testBoard[row][col] = humanPiece;
    if (isGomokuWin(testBoard, row, col, humanPiece)) {
      return [row, col];
    }
  }

  const center = Math.floor(GOMOKU_SIZE / 2);
  let best: [number, number] | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const [row, col] of candidates) {
    const dist = Math.abs(row - center) + Math.abs(col - center);
    if (dist < bestDist) {
      bestDist = dist;
      best = [row, col];
    }
  }
  return best ?? candidates[0];
}

function pickByScoring(board: number[][], candidates: Array<[number, number]>, aiPiece: Piece): [number, number] {
  const humanPiece: Piece = aiPiece === 1 ? 2 : 1;
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestMoves: Array<[number, number]> = [];

  for (const [row, col] of candidates) {
    const attackScore = evaluatePoint(board, row, col, aiPiece);
    const defendScore = evaluatePoint(board, row, col, humanPiece);
    const centerBias = 20 - (Math.abs(row - 7) + Math.abs(col - 7));
    const total = attackScore * 1.08 + defendScore * 0.95 + centerBias;
    if (total > bestScore) {
      bestScore = total;
      bestMoves = [[row, col]];
    } else if (total === bestScore) {
      bestMoves.push([row, col]);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? candidates[0];
}

export function selectGomokuAIMove(board: number[][], difficulty: GomokuAIDifficulty, aiPiece: Piece): [number, number] | null {
  const candidates = collectCandidateCells(board);
  if (candidates.length === 0) {
    return null;
  }

  if (difficulty === 'novice') {
    return pickByRulePriority(board, candidates, aiPiece);
  }

  return pickByScoring(board, candidates, aiPiece);
}
