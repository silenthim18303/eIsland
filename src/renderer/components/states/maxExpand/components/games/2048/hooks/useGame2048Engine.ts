import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { SLIDE_MS } from '../config/constants';
import type { Dir, Game2048Props, Game2048Session, TileData } from '../config/types';
import { clearState, saveState } from '../utils/storage';
import { DeterministicRandom } from '../utils/random';
import { canMove, computeMove, createInitial, getTileSeq, initTiles, spawn } from '../utils/board';

interface UseGame2048EngineParams {
  onGameEnd?: Game2048Props['onGameEnd'];
  onStateChange?: Game2048Props['onStateChange'];
  activeSession?: Game2048Session | null;
}

interface UseGame2048EngineResult {
  boardRef: RefObject<HTMLDivElement | null>;
  tiles: TileData[];
  over: boolean;
  mergedIds: Set<number>;
  newId: number | null;
  newGame: (session?: Game2048Session | null) => void;
  doMove: (dir: Dir) => void;
}

export function useGame2048Engine({
  onGameEnd,
  onStateChange,
  activeSession,
}: UseGame2048EngineParams): UseGame2048EngineResult {
  const boardRef = useRef<HTMLDivElement>(null);
  const [initial] = useState(createInitial);
  const [tiles, setTiles] = useState<TileData[]>(initial.tiles);
  const [score, setScore] = useState(initial.score);
  const [best, setBest] = useState(initial.best);
  const [over, setOver] = useState(false);
  const [mergedIds, setMergedIds] = useState<Set<number>>(new Set());
  const [newId, setNewId] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(initial.moveCount);

  const startRef = useRef(initial.startTime);
  const movingRef = useRef(false);
  const randomRef = useRef<DeterministicRandom>(new DeterministicRandom(initial.randomState));
  const sessionRef = useRef<Game2048Session | null>(activeSession ?? null);
  const appliedSessionIdRef = useRef<string | null>(null);
  const moveTraceRef = useRef(initial.moveTrace);

  const startRound = useCallback((session?: Game2048Session | null) => {
    const selectedSession = session ?? activeSession ?? null;
    const seed = selectedSession?.seed ?? Date.now();
    randomRef.current = new DeterministicRandom(seed);
    sessionRef.current = selectedSession;
    moveTraceRef.current = '';

    const nextTiles = initTiles(randomRef.current);
    setTiles(nextTiles);
    setScore(0);
    setOver(false);
    setMergedIds(new Set());
    setNewId(null);
    setMoveCount(0);
    startRef.current = selectedSession?.startedAt ?? 0;
    clearState();
    onStateChange?.({ score: 0, best, over: false, moveCount: 0 });
    boardRef.current?.focus();
  }, [activeSession, best, onStateChange]);

  useEffect(() => {
    if (initial.score > 0) {
      onStateChange?.({ score: initial.score, best: initial.best, over: false, moveCount: initial.moveCount });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const newGame = useCallback((session?: Game2048Session | null) => {
    startRound(session);
  }, [startRound]);

  useEffect(() => {
    if (!activeSession?.sessionId) return;
    if (appliedSessionIdRef.current === activeSession.sessionId) return;
    appliedSessionIdRef.current = activeSession.sessionId;
    startRound(activeSession);
  }, [activeSession, startRound]);

  const doMove = useCallback((dir: Dir) => {
    if (movingRef.current || over) return;
    const result = computeMove(tiles, dir);
    if (!result.moved) return;
    if (startRef.current === 0) startRef.current = Date.now();
    movingRef.current = true;
    setTiles(result.tiles);
    setTimeout(() => {
      let resolved = result.tiles;
      for (const m of result.merges) {
        resolved = resolved
          .filter((t) => t.id !== m.absorbedId)
          .map((t) => (t.id === m.survivorId ? { ...t, value: m.newValue } : t));
      }
      const nt = spawn(resolved, randomRef.current);
      if (nt) {
        resolved = [...resolved, nt];
        setNewId(nt.id);
      }
      setMergedIds(new Set(result.merges.map((m) => m.survivorId)));
      setTiles(resolved);
      const ns = score + result.scoreGained;
      setScore(ns);
      const nm = moveCount + 1;
      setMoveCount((c) => c + 1);
      moveTraceRef.current += dir === 'left' ? 'L' : dir === 'right' ? 'R' : dir === 'up' ? 'U' : 'D';
      const nb = Math.max(ns, best);
      if (ns > best) setBest(ns);
      const isOver = !canMove(resolved);
      if (isOver) {
        setOver(true);
        clearState();
        const achievedAt = Date.now();
        const duration = startRef.current > 0 ? Math.max(1, achievedAt - startRef.current) : 1;
        onGameEnd?.({
          score: ns,
          durationMs: duration,
          moves: nm,
          achievedAt,
          sessionId: sessionRef.current?.sessionId,
          moveTrace: moveTraceRef.current,
        });
      } else {
        saveState({
          tiles: resolved,
          score: ns,
          best: nb,
          moveCount: nm,
          startTime: startRef.current,
          tileSeq: getTileSeq(),
          moveTrace: moveTraceRef.current,
          randomState: randomRef.current.getState(),
        });
      }
      onStateChange?.({ score: ns, best: nb, over: isOver, moveCount: nm });
      setTimeout(() => {
        setMergedIds(new Set());
        setNewId(null);
        movingRef.current = false;
      }, 150);
    }, SLIDE_MS);
  }, [tiles, score, best, over, moveCount, onGameEnd, onStateChange]);

  return {
    boardRef,
    tiles,
    over,
    mergedIds,
    newId,
    newGame,
    doMove,
  };
}
