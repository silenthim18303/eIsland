export const GOMOKU_SIZE = 15;

export type GomokuAIDifficulty = 'novice' | 'easy' | 'hard' | 'expert' | 'master';
export type GomokuMovePosition = [number, number];

export interface GameGomokuState {
  board: number[][];
  turn: 1 | 2;
  winner: 1 | 2 | 0;
  moves: number;
  scale: number;
  lastMove: GomokuMovePosition | null;
}

export interface GameGomokuHandle {
  restart: () => void;
}

export interface GameGomokuProps {
  storageKey?: string;
  onStateChange?: (state: GameGomokuState) => void;
  aiDifficulty?: GomokuAIDifficulty;
  highlightMove?: GomokuMovePosition | null;
  highlightPulse?: number;
  resultOverlayText?: string | null;
  boardAriaLabel: string;
  getCellAriaLabel: (row: number, col: number) => string;
}
