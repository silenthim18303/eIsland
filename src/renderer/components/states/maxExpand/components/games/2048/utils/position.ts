import { CELL, GAP, PAD } from '../config/constants';

export function resolveTilePosition(row: number, col: number): { left: number; top: number } {
  return {
    left: PAD + col * (CELL + GAP),
    top: PAD + row * (CELL + GAP),
  };
}
