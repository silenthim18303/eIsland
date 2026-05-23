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
