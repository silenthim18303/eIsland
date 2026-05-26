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
 * @file GameGomokuBoard.tsx
 * @description 五子棋棋盘渲染组件。
 * @author 鸡哥
 */

import type { ReactElement, WheelEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { GomokuMovePosition } from '../config/types';
import { GOMOKU_SIZE } from '../config/types';

interface GameGomokuBoardProps {
  board: number[][];
  winner: 1 | 2 | 0;
  scale: number;
  highlightMove?: GomokuMovePosition | null;
  highlightPulse?: number;
  resultOverlayText?: string | null;
  onRestart?: () => void;
  boardAriaLabel: string;
  getCellAriaLabel: (row: number, col: number) => string;
  onCellClick: (row: number, col: number) => void;
  onBoardWheel: (event: WheelEvent<HTMLDivElement>) => void;
}

/**
 * 渲染五子棋棋盘与落子状态。
 */
export function GameGomokuBoard({
  board,
  winner,
  scale,
  highlightMove,
  highlightPulse,
  resultOverlayText,
  onRestart,
  boardAriaLabel,
  getCellAriaLabel,
  onCellClick,
  onBoardWheel,
}: GameGomokuBoardProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="gomoku-board-zoom">
      <div className="gomoku-board-scroll" onWheel={onBoardWheel}>
        <div
          className="gomoku-board"
          role="grid"
          aria-label={boardAriaLabel}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {board.map((row, rowIdx) => row.map((cell, colIdx) => (
            (() => {
              const shouldHighlight = Boolean(
                highlightMove
                && highlightPulse
                && highlightMove[0] === rowIdx
                && highlightMove[1] === colIdx,
              );
              const highlightClass = shouldHighlight
                ? ` gomoku-last-move-highlight-${highlightPulse! % 2}`
                : '';
              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  type="button"
                  className={`gomoku-cell${(rowIdx === 3 || rowIdx === 7 || rowIdx === 11) && (colIdx === 3 || colIdx === 7 || colIdx === 11) ? ' star' : ''}${rowIdx === 0 ? ' edge-top' : ''}${rowIdx === GOMOKU_SIZE - 1 ? ' edge-bottom' : ''}${colIdx === 0 ? ' edge-left' : ''}${colIdx === GOMOKU_SIZE - 1 ? ' edge-right' : ''}${cell === 1 ? ' black' : ''}${cell === 2 ? ' white' : ''}${highlightClass}`}
                  onClick={() => onCellClick(rowIdx, colIdx)}
                  disabled={cell !== 0 || winner !== 0}
                  aria-label={getCellAriaLabel(rowIdx + 1, colIdx + 1)}
                >
                  <span className="gomoku-star" aria-hidden="true" />
                  <span className="gomoku-piece" />
                </button>
              );
            })()
          )))}
        </div>
      </div>
      {resultOverlayText && (
        <div className="g2048-overlay gomoku-result-overlay">
          <span className="g2048-overlay-text">{resultOverlayText}</span>
          <button className="settings-lyrics-source-btn" type="button" onClick={onRestart}>
            {t('miniGameTab.gomoku.restart')}
          </button>
        </div>
      )}
    </div>
  );
}
