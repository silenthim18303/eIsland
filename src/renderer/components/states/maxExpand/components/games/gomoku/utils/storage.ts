import type { GameGomokuState } from '../config/types';
import { GOMOKU_SIZE } from '../config/types';

export function normalizeGomokuStoredState(raw: unknown): GameGomokuState | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const candidate = raw as Partial<GameGomokuState>;
  if (!Array.isArray(candidate.board) || candidate.board.length !== GOMOKU_SIZE) {
    return null;
  }
  const board = candidate.board.map((row) => {
    if (!Array.isArray(row) || row.length !== GOMOKU_SIZE) {
      return null;
    }
    const normalizedRow = row.map((cell) => {
      if (cell === 1 || cell === 2) return cell;
      if (cell === 0) return 0;
      return null;
    });
    if (normalizedRow.some((cell) => cell === null)) {
      return null;
    }
    return normalizedRow as number[];
  });
  if (board.some((row) => row === null)) {
    return null;
  }

  const turn = candidate.turn === 2 ? 2 : 1;
  const winner = candidate.winner === 1 || candidate.winner === 2 ? candidate.winner : 0;
  const moves = Number.isInteger(candidate.moves)
    ? Math.min(GOMOKU_SIZE * GOMOKU_SIZE, Math.max(0, Number(candidate.moves)))
    : 0;
  const scaleRaw = typeof candidate.scale === 'number' ? candidate.scale : 1;
  const scale = Math.min(1.8, Math.max(1, Number(scaleRaw.toFixed(2))));
  const rawLastMove = candidate.lastMove;
  const lastMove = Array.isArray(rawLastMove)
    && rawLastMove.length === 2
    && Number.isInteger(rawLastMove[0])
    && Number.isInteger(rawLastMove[1])
    && Number(rawLastMove[0]) >= 0
    && Number(rawLastMove[0]) < GOMOKU_SIZE
    && Number(rawLastMove[1]) >= 0
    && Number(rawLastMove[1]) < GOMOKU_SIZE
    ? [Number(rawLastMove[0]), Number(rawLastMove[1])] as [number, number]
    : null;

  return {
    board: board as number[][],
    turn,
    winner,
    moves,
    scale,
    lastMove,
  };
}
