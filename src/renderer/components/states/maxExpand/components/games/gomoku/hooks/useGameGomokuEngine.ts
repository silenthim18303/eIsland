import { useCallback, useEffect, useRef, useState, type WheelEvent } from 'react';
import type { GameGomokuState, GomokuAIDifficulty } from '../config/types';
import { GOMOKU_SIZE } from '../config/types';
import { createGomokuBoard, isGomokuWin } from '../utils/board';
import { selectGomokuAIMove } from '../utils/ai';
import { normalizeGomokuStoredState } from '../utils/storage';

interface UseGameGomokuEngineParams {
  storageKey?: string;
  onStateChange?: (state: GameGomokuState) => void;
  aiDifficulty?: GomokuAIDifficulty;
}

interface UseGameGomokuEngineResult {
  board: number[][];
  winner: 1 | 2 | 0;
  scale: number;
  onCellClick: (row: number, col: number) => void;
  onBoardWheel: (event: WheelEvent<HTMLDivElement>) => void;
  restart: () => void;
}

export function useGameGomokuEngine({
  storageKey,
  onStateChange,
  aiDifficulty,
}: UseGameGomokuEngineParams): UseGameGomokuEngineResult {
  const [board, setBoard] = useState<number[][]>(() => createGomokuBoard());
  const [turn, setTurn] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<1 | 2 | 0>(0);
  const [moves, setMoves] = useState(0);
  const [scale, setScale] = useState(1);
  const [stateReady, setStateReady] = useState(false);
  const lastReportedRef = useRef<string>('');
  const moveSoundRef = useRef<HTMLAudioElement | null>(null);

  const playMoveSound = useCallback(() => {
    if (!moveSoundRef.current) {
      moveSoundRef.current = new Audio('./audio/GOMOKU.wav');
      moveSoundRef.current.preload = 'auto';
      moveSoundRef.current.loop = false;
    }
    const audio = moveSoundRef.current;
    try {
      audio.currentTime = 0;
    } catch {
      // noop
    }
    audio.play().catch(() => {
      audio.src = '/audio/GOMOKU.wav';
      try {
        audio.currentTime = 0;
      } catch {
        // noop
      }
      void audio.play().catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (!storageKey) {
      setStateReady(true);
      return;
    }
    let cancelled = false;
    window.api.storeRead(storageKey).then((savedState) => {
      if (cancelled) return;
      const normalized = normalizeGomokuStoredState(savedState);
      if (normalized) {
        setBoard(normalized.board);
        setTurn(normalized.turn);
        setWinner(normalized.winner);
        setMoves(normalized.moves);
        setScale(normalized.scale);
      }
      setStateReady(true);
    }).catch(() => {
      if (cancelled) return;
      setStateReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!stateReady || !storageKey) {
      return;
    }
    const payload: GameGomokuState = {
      board,
      turn,
      winner,
      moves,
      scale,
    };
    window.api.storeWrite(storageKey, payload).catch(() => {});
  }, [board, moves, scale, stateReady, storageKey, turn, winner]);

  useEffect(() => {
    if (!onStateChange) {
      return;
    }
    const snapshot: GameGomokuState = {
      board,
      turn,
      winner,
      moves,
      scale,
    };
    const signature = `${turn}-${winner}-${moves}-${scale}`;
    if (lastReportedRef.current === signature) {
      return;
    }
    lastReportedRef.current = signature;
    onStateChange(snapshot);
  }, [board, moves, onStateChange, scale, turn, winner]);

  const restart = useCallback(() => {
    setBoard(createGomokuBoard());
    setTurn(1);
    setWinner(0);
    setMoves(0);
  }, []);

  const onCellClick = useCallback((row: number, col: number) => {
    if (winner !== 0 || board[row]?.[col] !== 0) {
      return;
    }

    if (aiDifficulty && turn === 2) {
      return;
    }

    const piece = turn;
    const nextBoard = board.map((line) => [...line]);
    nextBoard[row][col] = piece;
    const nextMoves = moves + 1;

    setBoard(nextBoard);
    setMoves(nextMoves);
    playMoveSound();

    if (isGomokuWin(nextBoard, row, col, piece)) {
      setWinner(piece);
      return;
    }

    if (nextMoves >= GOMOKU_SIZE * GOMOKU_SIZE) {
      return;
    }

    setTurn(piece === 1 ? 2 : 1);
  }, [aiDifficulty, board, moves, playMoveSound, turn, winner]);

  useEffect(() => {
    if (!aiDifficulty || winner !== 0 || turn !== 2 || moves >= GOMOKU_SIZE * GOMOKU_SIZE) {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextMove = selectGomokuAIMove(board, aiDifficulty, 2);
      if (!nextMove) {
        return;
      }
      const [row, col] = nextMove;
      if (board[row]?.[col] !== 0) {
        return;
      }

      const piece: 1 | 2 = 2;
      const nextBoard = board.map((line) => [...line]);
      nextBoard[row][col] = piece;
      const nextMoves = moves + 1;

      setBoard(nextBoard);
      setMoves(nextMoves);
      playMoveSound();

      if (isGomokuWin(nextBoard, row, col, piece)) {
        setWinner(piece);
        return;
      }

      if (nextMoves >= GOMOKU_SIZE * GOMOKU_SIZE) {
        return;
      }

      setTurn(1);
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [aiDifficulty, board, moves, playMoveSound, turn, winner]);

  const onBoardWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    setScale((prev) => {
      const next = prev + delta;
      return Math.min(1.8, Math.max(1, Number(next.toFixed(2))));
    });
  }, []);

  return {
    board,
    winner,
    scale,
    onCellClick,
    onBoardWheel,
    restart,
  };
}
