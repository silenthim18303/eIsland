export const GOMOKU_SIZE = 15;

export type GomokuAIDifficulty = 'novice' | 'easy';

export interface GameGomokuState {
  board: number[][];
  turn: 1 | 2;
  winner: 1 | 2 | 0;
  moves: number;
  scale: number;
}

export interface GameGomokuHandle {
  restart: () => void;
}

export interface GameGomokuProps {
  storageKey?: string;
  onStateChange?: (state: GameGomokuState) => void;
  aiDifficulty?: GomokuAIDifficulty;
  boardAriaLabel: string;
  getCellAriaLabel: (row: number, col: number) => string;
}
