import { STORAGE_KEY } from '../config/constants';
import type { SavedState } from '../config/types';

export function saveState(s: SavedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function loadState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SavedState;
    if (!Array.isArray(s.tiles)) return null;
    if (typeof s.score !== 'number' || typeof s.best !== 'number') return null;
    if (typeof s.moveCount !== 'number' || typeof s.startTime !== 'number') return null;
    if (typeof s.tileSeq !== 'number' || typeof s.randomState !== 'number') return null;
    return s;
  } catch {
    return null;
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
