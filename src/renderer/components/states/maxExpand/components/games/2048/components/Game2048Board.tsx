import type { ReactElement, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { BOARD, CELL, SIZE, SLIDE_MS } from '../config/constants';
import type { TileData } from '../config/types';
import { resolveTilePosition } from '../utils/position';

interface Game2048BoardProps {
  boardRef: RefObject<HTMLDivElement | null>;
  tiles: TileData[];
  mergedIds: Set<number>;
  newId: number | null;
  over: boolean;
  onTryAgain: () => void;
}

export function Game2048Board({
  boardRef,
  tiles,
  mergedIds,
  newId,
  over,
  onTryAgain,
}: Game2048BoardProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="g2048-board" ref={boardRef} tabIndex={0} style={{ width: BOARD, height: BOARD }}>
      {Array.from({ length: SIZE * SIZE }, (_, i) => (
        <div
          key={`bg${i}`}
          className="g2048-cell-bg"
          style={{ ...resolveTilePosition(Math.floor(i / SIZE), i % SIZE), width: CELL, height: CELL, position: 'absolute' }}
        />
      ))}
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className={`g2048-tile g2048-v${Math.min(tile.value, 8192)}${mergedIds.has(tile.id) ? ' g2048-pop' : ''}${tile.id === newId ? ' g2048-appear' : ''}`}
          style={{
            ...resolveTilePosition(tile.row, tile.col),
            width: CELL,
            height: CELL,
            position: 'absolute',
            transition: `top ${SLIDE_MS}ms ease, left ${SLIDE_MS}ms ease`,
          }}
        >
          {tile.value}
        </div>
      ))}
      {over && (
        <div className="g2048-overlay">
          <span className="g2048-overlay-text">{t('miniGameTab.game2048.gameOver')}</span>
          <button className="settings-lyrics-source-btn" type="button" onClick={onTryAgain}>
            {t('miniGameTab.game2048.tryAgain')}
          </button>
        </div>
      )}
    </div>
  );
}
