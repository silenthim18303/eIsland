import { forwardRef, useImperativeHandle, type ReactElement } from 'react';
import type { GameGomokuHandle, GameGomokuProps } from '../config/types';
import { useGameGomokuEngine } from '../hooks/useGameGomokuEngine';
import { GameGomokuBoard } from './GameGomokuBoard';

export const GameGomoku = forwardRef<GameGomokuHandle, GameGomokuProps>(function GameGomoku({
  storageKey,
  onStateChange,
  aiDifficulty,
  highlightMove,
  highlightPulse,
  resultOverlayText,
  boardAriaLabel,
  getCellAriaLabel,
}, fwdRef): ReactElement {
  const {
    board,
    winner,
    scale,
    onCellClick,
    onBoardWheel,
    restart,
  } = useGameGomokuEngine({ storageKey, onStateChange, aiDifficulty });

  useImperativeHandle(fwdRef, () => ({ restart }), [restart]);

  return (
    <GameGomokuBoard
      board={board}
      winner={winner}
      scale={scale}
      highlightMove={highlightMove}
      highlightPulse={highlightPulse}
      resultOverlayText={resultOverlayText}
      boardAriaLabel={boardAriaLabel}
      getCellAriaLabel={getCellAriaLabel}
      onCellClick={onCellClick}
      onBoardWheel={onBoardWheel}
    />
  );
});
