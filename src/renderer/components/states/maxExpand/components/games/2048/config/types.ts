export interface TileData { id: number; value: number; row: number; col: number; }

export interface MergeInfo { survivorId: number; absorbedId: number; newValue: number; }

export interface MoveResult { tiles: TileData[]; merges: MergeInfo[]; scoreGained: number; moved: boolean; }

export type Dir = 'left' | 'right' | 'up' | 'down';

export interface Game2048Session { sessionId: string; seed: number; startedAt: number; }

export interface Game2048EndPayload {
  score: number;
  durationMs: number;
  moves: number;
  achievedAt: number;
  sessionId?: string;
  moveTrace?: string;
}

export interface Game2048State { score: number; best: number; over: boolean; moveCount: number; }

export interface Game2048Handle { newGame: (session?: Game2048Session | null) => void; }

export interface Game2048Props {
  onGameEnd?: (payload: Game2048EndPayload) => void;
  onStateChange?: (state: Game2048State) => void;
  activeSession?: Game2048Session | null;
}

export interface SavedState {
  tiles: TileData[];
  score: number;
  best: number;
  moveCount: number;
  startTime: number;
  tileSeq: number;
  moveTrace: string;
  randomState: number;
}

export interface InitialGame2048State {
  tiles: TileData[];
  score: number;
  best: number;
  moveCount: number;
  startTime: number;
  moveTrace: string;
  randomState: number;
}
