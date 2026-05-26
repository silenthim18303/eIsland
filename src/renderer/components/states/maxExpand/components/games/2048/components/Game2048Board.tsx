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
 * @file Game2048Board.tsx
 * @description 2048 游戏棋盘渲染组件。
 * @author 鸡哥
 */

import type { ReactElement, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { BOARD, CELL, SIZE, SLIDE_MS } from '../config/constants';
import type { TileData } from '../config/types';
import { resolveTilePosition } from '../utils/position';

function resolveCellStyle(row: number, col: number): { left: number; top: number; width: number; height: number; position: 'absolute' } {
  const position = resolveTilePosition(row, col);
  return {
    left: position.left,
    top: position.top,
    width: CELL,
    height: CELL,
    position: 'absolute',
  };
}

function resolveTileStyle(row: number, col: number): {
  left: number;
  top: number;
  width: number;
  height: number;
  position: 'absolute';
  transition: string;
} {
  const position = resolveTilePosition(row, col);
  return {
    left: position.left,
    top: position.top,
    width: CELL,
    height: CELL,
    position: 'absolute',
    transition: `top ${SLIDE_MS}ms ease, left ${SLIDE_MS}ms ease`,
  };
}

interface Game2048BoardProps {
  boardRef: RefObject<HTMLDivElement | null>;
  tiles: TileData[];
  mergedIds: Set<number>;
  newId: number | null;
  over: boolean;
  onTryAgain: () => void;
}

/**
 * 渲染 2048 棋盘与方块。
 */
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
          style={resolveCellStyle(Math.floor(i / SIZE), i % SIZE)}
        />
      ))}
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className={`g2048-tile g2048-v${Math.min(tile.value, 8192)}${mergedIds.has(tile.id) ? ' g2048-pop' : ''}${tile.id === newId ? ' g2048-appear' : ''}`}
          style={resolveTileStyle(tile.row, tile.col)}
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
