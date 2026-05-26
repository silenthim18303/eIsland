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
 * @file ai.ts
 * @description 五子棋 AI 选点策略与搜索实现。
 * @author 鸡哥
 */

import type { GomokuAIDifficulty } from '../config/types';
import { GOMOKU_SIZE } from '../config/types';
import { isGomokuWin } from './board';

type Piece = 1 | 2;
type Move = [number, number];

const DIRECTIONS: Array<[number, number]> = [[1, 0], [0, 1], [1, 1], [1, -1]];
const WIN_SCORE = 20_000_000;
const NEGAMAX_CANDIDATE_LIMIT = 12;
const MCTS_CANDIDATE_LIMIT = 10;

interface MCTSNode {
  board: number[][];
  playerToMove: Piece;
  move: Move | null;
  lastMove: Move | null;
  lastPiece: Piece | null;
  parent: MCTSNode | null;
  children: MCTSNode[];
  untriedMoves: Move[];
  visits: number;
  wins: number;
}

function cloneBoard(board: number[][]): number[][] {
  return board.map((line) => [...line]);
}

function opponentOf(piece: Piece): Piece {
  return piece === 1 ? 2 : 1;
}

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

function collectCandidateCells(board: number[][], distance = 2): Move[] {
  const used = board.some((row) => row.some((cell) => cell !== 0));
  if (!used) {
    const center = Math.floor(GOMOKU_SIZE / 2);
    return [[center, center]];
  }

  const nearby: Move[] = [];
  const fallback: Move[] = [];
  for (let row = 0; row < GOMOKU_SIZE; row += 1) {
    for (let col = 0; col < GOMOKU_SIZE; col += 1) {
      if (board[row][col] !== 0) {
        continue;
      }
      fallback.push([row, col]);
      if (hasNeighbor(board, row, col, distance)) {
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
  DIRECTIONS.forEach(([dx, dy]) => {
    const line = measureLine(board, row, col, dx, dy, piece);
    score += patternScore(line.count, line.open);
  });
  return score;
}

function evaluateBoard(board: number[][], aiPiece: Piece): number {
  const humanPiece = opponentOf(aiPiece);
  const candidates = collectCandidateCells(board, 2);
  if (candidates.length === 0) {
    return 0;
  }
  let aiScore = 0;
  let humanScore = 0;
  candidates.forEach(([row, col]) => {
    aiScore += evaluatePoint(board, row, col, aiPiece);
    humanScore += evaluatePoint(board, row, col, humanPiece);
  });
  return aiScore * 1.06 - humanScore;
}

function rankCandidates(
  board: number[][],
  candidates: Move[],
  currentPiece: Piece,
  aiPiece: Piece,
  limit: number,
): Move[] {
  const enemy = opponentOf(currentPiece);
  const center = Math.floor(GOMOKU_SIZE / 2);
  const weighted = candidates.map(([row, col]) => {
    const attack = evaluatePoint(board, row, col, currentPiece);
    const defend = evaluatePoint(board, row, col, enemy);
    const aiBias = evaluatePoint(board, row, col, aiPiece) * 0.45;
    const centerBias = 16 - (Math.abs(row - center) + Math.abs(col - center));
    return {
      move: [row, col] as Move,
      score: attack * 1.14 + defend * 0.98 + aiBias + centerBias,
    };
  });
  weighted.sort((a, b) => b.score - a.score);
  return weighted.slice(0, Math.max(1, limit)).map((item) => item.move);
}

function placeAndCheckWin(board: number[][], move: Move, piece: Piece): boolean {
  const [row, col] = move;
  board[row][col] = piece;
  const won = isGomokuWin(board, row, col, piece);
  board[row][col] = 0;
  return won;
}

function findImmediateWinningMove(board: number[][], candidates: Move[], piece: Piece): Move | null {
  const found = candidates.find((move) => placeAndCheckWin(board, move, piece));
  return found ?? null;
}

function findForcedBlockMove(board: number[][], candidates: Move[], aiPiece: Piece): Move | null {
  const humanPiece = opponentOf(aiPiece);
  return findImmediateWinningMove(board, candidates, humanPiece);
}

function pickByRulePriority(board: number[][], candidates: Move[], aiPiece: Piece): Move {
  const humanPiece: Piece = aiPiece === 1 ? 2 : 1;

  const winningMove = candidates.find(([row, col]) => {
    const testBoard = board.map((line) => [...line]);
    testBoard[row][col] = aiPiece;
    return isGomokuWin(testBoard, row, col, aiPiece);
  });
  if (winningMove) {
    return winningMove;
  }

  const blockingMove = candidates.find(([row, col]) => {
    const testBoard = board.map((line) => [...line]);
    testBoard[row][col] = humanPiece;
    return isGomokuWin(testBoard, row, col, humanPiece);
  });
  if (blockingMove) {
    return blockingMove;
  }

  const center = Math.floor(GOMOKU_SIZE / 2);
  let best: Move | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  candidates.forEach(([row, col]) => {
    const dist = Math.abs(row - center) + Math.abs(col - center);
    if (dist < bestDist) {
      bestDist = dist;
      best = [row, col];
    }
  });
  return best ?? candidates[0];
}

function pickByScoring(board: number[][], candidates: Array<[number, number]>, aiPiece: Piece): [number, number] {
  const humanPiece: Piece = aiPiece === 1 ? 2 : 1;
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestMoves: Array<[number, number]> = [];

  candidates.forEach(([row, col]) => {
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
  });

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? candidates[0];
}

function negamax(
  board: number[][],
  depth: number,
  alpha: number,
  beta: number,
  currentPiece: Piece,
  aiPiece: Piece,
  lastMove: Move | null,
  lastPiece: Piece | null,
  startTime: number,
  timeBudgetMs: number,
): number {
  if (Date.now() - startTime > timeBudgetMs) {
    return evaluateBoard(board, aiPiece);
  }

  if (lastMove && lastPiece && isGomokuWin(board, lastMove[0], lastMove[1], lastPiece)) {
    return lastPiece === aiPiece ? WIN_SCORE + depth : -(WIN_SCORE + depth);
  }

  if (depth <= 0) {
    return evaluateBoard(board, aiPiece);
  }

  const allCandidates = collectCandidateCells(board, 2);
  if (allCandidates.length === 0) {
    return 0;
  }

  const ordered = rankCandidates(board, allCandidates, currentPiece, aiPiece, NEGAMAX_CANDIDATE_LIMIT);
  let best = Number.NEGATIVE_INFINITY;
  let nextAlpha = alpha;

  ordered.some(([row, col]) => {
    board[row][col] = currentPiece;
    const score = -negamax(
      board,
      depth - 1,
      -beta,
      -nextAlpha,
      opponentOf(currentPiece),
      aiPiece,
      [row, col],
      currentPiece,
      startTime,
      timeBudgetMs,
    );
    board[row][col] = 0;

    if (score > best) {
      best = score;
    }
    if (score > nextAlpha) {
      nextAlpha = score;
    }
    if (nextAlpha >= beta) {
      return true;
    }
    return false;
  });

  if (best === Number.NEGATIVE_INFINITY) {
    return evaluateBoard(board, aiPiece);
  }
  return best;
}

function pickByNegamax(board: number[][], aiPiece: Piece, depth: number, timeBudgetMs: number): Move | null {
  const allCandidates = collectCandidateCells(board, 2);
  if (allCandidates.length === 0) {
    return null;
  }

  const instantWin = findImmediateWinningMove(board, allCandidates, aiPiece);
  if (instantWin) {
    return instantWin;
  }
  const forcedBlock = findForcedBlockMove(board, allCandidates, aiPiece);
  if (forcedBlock) {
    return forcedBlock;
  }

  const startTime = Date.now();
  const ordered = rankCandidates(board, allCandidates, aiPiece, aiPiece, NEGAMAX_CANDIDATE_LIMIT);
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestMove = ordered[0] ?? allCandidates[0];
  let alpha = Number.NEGATIVE_INFINITY;

  ordered.some(([row, col]) => {
    if (Date.now() - startTime > timeBudgetMs) {
      return true;
    }
    board[row][col] = aiPiece;
    const score = isGomokuWin(board, row, col, aiPiece)
      ? WIN_SCORE
      : -negamax(
        board,
        depth - 1,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        opponentOf(aiPiece),
        aiPiece,
        [row, col],
        aiPiece,
        startTime,
        timeBudgetMs,
      );
    board[row][col] = 0;

    if (score > bestScore) {
      bestScore = score;
      bestMove = [row, col];
    }
    if (score > alpha) {
      alpha = score;
    }
    return false;
  });

  return bestMove;
}

function getNodeBestUCTChild(node: MCTSNode): MCTSNode {
  const exploration = 1.35;
  const unvisitedChild = node.children.find((child) => child.visits === 0);
  if (unvisitedChild) {
    return unvisitedChild;
  }
  let best = node.children[0];
  let bestScore = Number.NEGATIVE_INFINITY;
  node.children.forEach((child) => {
    const exploit = child.wins / child.visits;
    const explore = Math.sqrt(Math.log(Math.max(1, node.visits)) / child.visits);
    const score = exploit + exploration * explore;
    if (score > bestScore) {
      bestScore = score;
      best = child;
    }
  });
  return best;
}

function isTerminalNode(node: MCTSNode): boolean {
  if (node.lastMove && node.lastPiece && isGomokuWin(node.board, node.lastMove[0], node.lastMove[1], node.lastPiece)) {
    return true;
  }
  return collectCandidateCells(node.board, 1).length === 0;
}

function createNode(
  board: number[][],
  playerToMove: Piece,
  parent: MCTSNode | null,
  move: Move | null,
  lastMove: Move | null,
  lastPiece: Piece | null,
  aiPiece: Piece,
): MCTSNode {
  const candidates = collectCandidateCells(board, 2);
  return {
    board,
    playerToMove,
    parent,
    move,
    lastMove,
    lastPiece,
    children: [],
    untriedMoves: rankCandidates(board, candidates, playerToMove, aiPiece, MCTS_CANDIDATE_LIMIT),
    visits: 0,
    wins: 0,
  };
}

function rollout(
  startBoard: number[][],
  startPlayer: Piece,
  startLastMove: Move | null,
  startLastPiece: Piece | null,
  aiPiece: Piece,
  maxDepth: number,
  startedAt: number,
  timeBudgetMs: number,
): Piece | 0 {
  const board = cloneBoard(startBoard);
  let player = startPlayer;
  let lastMove = startLastMove;
  let lastPiece = startLastPiece;

  for (let step = 0; step < maxDepth; step += 1) {
    if (Date.now() - startedAt > timeBudgetMs) {
      break;
    }
    if (lastMove && lastPiece && isGomokuWin(board, lastMove[0], lastMove[1], lastPiece)) {
      return lastPiece;
    }

    const candidates = collectCandidateCells(board, 2);
    if (candidates.length === 0) {
      return 0;
    }

    const instantWin = findImmediateWinningMove(board, candidates, player);
    const block = instantWin ? null : findImmediateWinningMove(board, candidates, opponentOf(player));
    const ranked = rankCandidates(board, candidates, player, aiPiece, Math.min(MCTS_CANDIDATE_LIMIT, candidates.length));
    const movePool = ranked.length > 0 ? ranked : candidates;
    const move = instantWin
      ?? block
      ?? movePool[Math.floor(Math.random() * movePool.length)]
      ?? candidates[0];

    board[move[0]][move[1]] = player;
    lastMove = move;
    lastPiece = player;
    player = opponentOf(player);
  }

  if (lastMove && lastPiece && isGomokuWin(board, lastMove[0], lastMove[1], lastPiece)) {
    return lastPiece;
  }

  const score = evaluateBoard(board, aiPiece);
  if (score > 1500) {
    return aiPiece;
  }
  if (score < -1500) {
    return opponentOf(aiPiece);
  }
  return 0;
}

function runMCTS(board: number[][], aiPiece: Piece, timeBudgetMs: number): Move | null {
  const initialCandidates = collectCandidateCells(board, 2);
  if (initialCandidates.length === 0) {
    return null;
  }

  const instantWin = findImmediateWinningMove(board, initialCandidates, aiPiece);
  if (instantWin) {
    return instantWin;
  }
  const forcedBlock = findForcedBlockMove(board, initialCandidates, aiPiece);
  if (forcedBlock) {
    return forcedBlock;
  }

  const startedAt = Date.now();
  const root = createNode(cloneBoard(board), aiPiece, null, null, null, null, aiPiece);
  const deepeningDepths = [6, 10, 14, 18];
  const phaseBudget = Math.max(20, Math.floor(timeBudgetMs / deepeningDepths.length));

  deepeningDepths.forEach((rolloutDepth) => {
    const phaseStart = Date.now();
    while (Date.now() - startedAt < timeBudgetMs && Date.now() - phaseStart < phaseBudget) {
      let node = root;

      while (node.untriedMoves.length === 0 && node.children.length > 0 && !isTerminalNode(node)) {
        node = getNodeBestUCTChild(node);
      }

      if (!isTerminalNode(node) && node.untriedMoves.length > 0) {
        const nextMove = node.untriedMoves.shift() as Move;
        const nextBoard = cloneBoard(node.board);
        nextBoard[nextMove[0]][nextMove[1]] = node.playerToMove;
        const child = createNode(
          nextBoard,
          opponentOf(node.playerToMove),
          node,
          nextMove,
          nextMove,
          node.playerToMove,
          aiPiece,
        );
        node.children.push(child);
        node = child;
      }

      const winner = rollout(
        node.board,
        node.playerToMove,
        node.lastMove,
        node.lastPiece,
        aiPiece,
        rolloutDepth,
        startedAt,
        timeBudgetMs,
      );

      while (node) {
        node.visits += 1;
        if (winner === aiPiece) {
          node.wins += 1;
        } else if (winner === 0) {
          node.wins += 0.5;
        }
        node = node.parent as MCTSNode;
      }
    }
  });

  if (root.children.length === 0) {
    return rankCandidates(board, initialCandidates, aiPiece, aiPiece, 1)[0] ?? initialCandidates[0];
  }

  root.children.sort((a, b) => {
    if (b.visits !== a.visits) {
      return b.visits - a.visits;
    }
    const rateA = a.visits > 0 ? a.wins / a.visits : 0;
    const rateB = b.visits > 0 ? b.wins / b.visits : 0;
    return rateB - rateA;
  });

  return root.children[0]?.move ?? initialCandidates[0];
}

/**
 * 根据难度选择五子棋 AI 落点。
 */
export function selectGomokuAIMove(board: number[][], difficulty: GomokuAIDifficulty, aiPiece: Piece): [number, number] | null {
  const candidates = collectCandidateCells(board);
  if (candidates.length === 0) {
    return null;
  }

  if (difficulty === 'novice') {
    return pickByRulePriority(board, candidates, aiPiece);
  }

  if (difficulty === 'easy') {
    return pickByScoring(board, candidates, aiPiece);
  }

  if (difficulty === 'hard') {
    return pickByNegamax(board, aiPiece, 3, 170);
  }

  if (difficulty === 'expert') {
    return runMCTS(board, aiPiece, 280);
  }

  const tactical = pickByNegamax(board, aiPiece, 4, 230);
  if (tactical && placeAndCheckWin(board, tactical, aiPiece)) {
    return tactical;
  }
  return runMCTS(board, aiPiece, 420) ?? tactical ?? pickByScoring(board, candidates, aiPiece);
}
