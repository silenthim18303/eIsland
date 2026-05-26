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
 * @file Game2048.tsx
 * @description 2048 游戏主组件。
 * @author 鸡哥
 */

import { forwardRef, useImperativeHandle, type ReactElement } from 'react';
import type { Game2048Handle, Game2048Props } from '../config/types';
import { useGame2048Keyboard } from '../hooks/useGame2048Keyboard';
import { useGame2048Engine } from '../hooks/useGame2048Engine';
import { Game2048Board } from './Game2048Board';

export const Game2048 = forwardRef<Game2048Handle, Game2048Props>(function Game2048({ onGameEnd, onStateChange, activeSession }, fwdRef): ReactElement {
  const {
    boardRef,
    tiles,
    over,
    mergedIds,
    newId,
    newGame,
    doMove,
  } = useGame2048Engine({ onGameEnd, onStateChange, activeSession });

  useImperativeHandle(fwdRef, () => ({ newGame }), [newGame]);
  useGame2048Keyboard(boardRef, doMove);

  return (
    <Game2048Board
      boardRef={boardRef}
      tiles={tiles}
      mergedIds={mergedIds}
      newId={newId}
      over={over}
      onTryAgain={() => newGame()}
    />
  );
});
