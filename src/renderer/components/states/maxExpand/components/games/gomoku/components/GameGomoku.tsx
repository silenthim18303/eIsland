/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

/**
 * @file GameGomoku.tsx
 * @description 五子棋游戏主组件。
 * @author 鸡哥
 */

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
      onRestart={restart}
      boardAriaLabel={boardAriaLabel}
      getCellAriaLabel={getCellAriaLabel}
      onCellClick={onCellClick}
      onBoardWheel={onBoardWheel}
    />
  );
});
