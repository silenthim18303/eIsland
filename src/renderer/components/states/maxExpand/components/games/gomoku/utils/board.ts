import { GOMOKU_SIZE } from '../config/types';

export function createGomokuBoard(): number[][] {
  return Array.from({ length: GOMOKU_SIZE }, () => Array.from({ length: GOMOKU_SIZE }, () => 0));
}

export function isGomokuWin(board: number[][], row: number, col: number, piece: 1 | 2): boolean {
  const dirs: Array<[number, number]> = [[1, 0], [0, 1], [1, 1], [1, -1]];
  return dirs.some(([dx, dy]) => {
    let count = 1;
    for (let step = 1; step < 5; step += 1) {
      const nr = row + dx * step;
      const nc = col + dy * step;
      if (nr < 0 || nr >= GOMOKU_SIZE || nc < 0 || nc >= GOMOKU_SIZE || board[nr][nc] !== piece) {
        break;
      }
      count += 1;
    }
    for (let step = 1; step < 5; step += 1) {
      const nr = row - dx * step;
      const nc = col - dy * step;
      if (nr < 0 || nr >= GOMOKU_SIZE || nc < 0 || nc >= GOMOKU_SIZE || board[nr][nc] !== piece) {
        break;
      }
      count += 1;
    }
    return count >= 5;
  });
}
