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
    <div className="gomoku-board-zoom" onWheel={onBoardWheel}>
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
