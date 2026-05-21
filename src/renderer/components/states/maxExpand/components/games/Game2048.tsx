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
 * @description 2048 小游戏完整实现：4x4 滑块合并 + 滑动动画 + 分数追踪
 * @author 鸡哥
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

const SIZE = 4;
const CELL = 64;
const GAP = 7;
const PAD = 8;
const BOARD = SIZE * CELL + (SIZE - 1) * GAP + 2 * PAD;
const SLIDE_MS = 120;

interface TileData { id: number; value: number; row: number; col: number; }
interface MergeInfo { survivorId: number; absorbedId: number; newValue: number; }
interface MoveResult { tiles: TileData[]; merges: MergeInfo[]; scoreGained: number; moved: boolean; }
type Dir = 'left' | 'right' | 'up' | 'down';

export interface Game2048EndPayload { score: number; durationMs: number; moves: number; achievedAt: number; }
export interface Game2048State { score: number; best: number; over: boolean; moveCount: number; }
export interface Game2048Handle { newGame: () => void; }
export interface Game2048Props { onGameEnd?: (payload: Game2048EndPayload) => void; onStateChange?: (state: Game2048State) => void; }

let tileSeq = 1;

const STORAGE_KEY = 'island_game_2048_state';

interface SavedState {
  tiles: TileData[];
  score: number;
  best: number;
  moveCount: number;
  startTime: number;
  tileSeq: number;
}

function saveState(s: SavedState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

function loadState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SavedState;
    if (!Array.isArray(s.tiles) || s.tiles.length === 0) return null;
    return s;
  } catch { return null; }
}

function clearState(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

function emptyPos(tiles: TileData[]): Array<[number, number]> {
  const used = new Set(tiles.map(t => `${t.row},${t.col}`));
  const r: Array<[number, number]> = [];
  for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (!used.has(`${i},${j}`)) r.push([i, j]);
  return r;
}

function spawn(tiles: TileData[]): TileData | null {
  const e = emptyPos(tiles);
  if (!e.length) return null;
  const [row, col] = e[Math.floor(Math.random() * e.length)];
  return { id: tileSeq++, value: Math.random() < 0.9 ? 2 : 4, row, col };
}

function computeMove(tiles: TileData[], dir: Dir): MoveResult {
  const horiz = dir === 'left' || dir === 'right';
  const rev = dir === 'right' || dir === 'down';
  const lines: Map<number, TileData[]> = new Map();
  for (const t of tiles) {
    const k = horiz ? t.row : t.col;
    if (!lines.has(k)) lines.set(k, []);
    lines.get(k)!.push({ ...t });
  }
  const result: TileData[] = [];
  const merges: MergeInfo[] = [];
  let scoreGained = 0;
  for (let ln = 0; ln < SIZE; ln++) {
    const arr = lines.get(ln) || [];
    arr.sort((a, b) => {
      const pa = horiz ? a.col : a.row;
      const pb = horiz ? b.col : b.row;
      return rev ? pb - pa : pa - pb;
    });
    let target = rev ? SIZE - 1 : 0;
    const step = rev ? -1 : 1;
    let i = 0;
    while (i < arr.length) {
      const cur = arr[i];
      if (i + 1 < arr.length && arr[i + 1].value === cur.value) {
        const nxt = arr[i + 1];
        const nv = cur.value * 2;
        scoreGained += nv;
        if (horiz) { cur.col = target; nxt.col = target; } else { cur.row = target; nxt.row = target; }
        merges.push({ survivorId: cur.id, absorbedId: nxt.id, newValue: nv });
        result.push(cur, nxt);
        target += step;
        i += 2;
      } else {
        if (horiz) cur.col = target; else cur.row = target;
        result.push(cur);
        target += step;
        i += 1;
      }
    }
  }
  const moved = tiles.some(o => { const u = result.find(t => t.id === o.id); return u && (u.row !== o.row || u.col !== o.col); });
  return { tiles: result, merges, scoreGained, moved };
}

function canMove(tiles: TileData[]): boolean {
  for (const d of ['left', 'right', 'up', 'down'] as Dir[]) if (computeMove(tiles, d).moved) return true;
  return false;
}

function initTiles(): TileData[] {
  tileSeq = 1;
  const t1 = spawn([])!;
  const arr = [t1];
  const t2 = spawn(arr);
  if (t2) arr.push(t2);
  return arr;
}

function loadOrInit(): { tiles: TileData[]; score: number; best: number; moveCount: number; startTime: number } {
  const saved = loadState();
  if (saved) {
    tileSeq = saved.tileSeq;
    return { tiles: saved.tiles, score: saved.score, best: saved.best, moveCount: saved.moveCount, startTime: saved.startTime };
  }
  return { tiles: initTiles(), score: 0, best: 0, moveCount: 0, startTime: 0 };
}

export const Game2048 = forwardRef<Game2048Handle, Game2048Props>(function Game2048({ onGameEnd, onStateChange }, fwdRef): ReactElement {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [initial] = useState(loadOrInit);
  const [tiles, setTiles] = useState<TileData[]>(initial.tiles);
  const [score, setScore] = useState(initial.score);
  const [best, setBest] = useState(initial.best);
  const [over, setOver] = useState(false);
  const [mergedIds, setMergedIds] = useState<Set<number>>(new Set());
  const [newId, setNewId] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(initial.moveCount);
  const startRef = useRef(initial.startTime);
  const movingRef = useRef(false);

  useEffect(() => {
    if (initial.score > 0) {
      onStateChange?.({ score: initial.score, best: initial.best, over: false, moveCount: initial.moveCount });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const newGame = useCallback(() => {
    const t = initTiles();
    setTiles(t);
    setScore(0);
    setOver(false);
    setMergedIds(new Set());
    setNewId(null);
    setMoveCount(0);
    startRef.current = 0;
    clearState();
    onStateChange?.({ score: 0, best, over: false, moveCount: 0 });
    ref.current?.focus();
  }, [best, onStateChange]);

  useImperativeHandle(fwdRef, () => ({ newGame }), [newGame]);

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
        resolved = resolved.filter(t => t.id !== m.absorbedId).map(t => t.id === m.survivorId ? { ...t, value: m.newValue } : t);
      }
      const nt = spawn(resolved);
      if (nt) { resolved = [...resolved, nt]; setNewId(nt.id); }
      setMergedIds(new Set(result.merges.map(m => m.survivorId)));
      setTiles(resolved);
      const ns = score + result.scoreGained;
      setScore(ns);
      const nm = moveCount + 1;
      setMoveCount(c => c + 1);
      const nb = Math.max(ns, best);
      if (ns > best) setBest(ns);
      const isOver = !canMove(resolved);
      if (isOver) {
        setOver(true);
        clearState();
        onGameEnd?.({ score: ns, durationMs: Date.now() - startRef.current, moves: nm, achievedAt: Date.now() });
      } else {
        saveState({ tiles: resolved, score: ns, best: nb, moveCount: nm, startTime: startRef.current, tileSeq });
      }
      onStateChange?.({ score: ns, best: nb, over: isOver, moveCount: nm });
      setTimeout(() => { setMergedIds(new Set()); setNewId(null); movingRef.current = false; }, 150);
    }, SLIDE_MS);
  }, [tiles, score, best, over, moveCount, onGameEnd]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: KeyboardEvent): void => {
      const map: Record<string, Dir> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
      const d = map[e.key];
      if (d) { e.preventDefault(); doMove(d); }
    };
    el.addEventListener('keydown', handler);
    el.focus();
    return () => el.removeEventListener('keydown', handler);
  }, [doMove]);

  const pos = (row: number, col: number) => ({ left: PAD + col * (CELL + GAP), top: PAD + row * (CELL + GAP) });

  return (
    <div className="g2048-board" ref={ref} tabIndex={0} style={{ width: BOARD, height: BOARD }}>
      {Array.from({ length: SIZE * SIZE }, (_, i) => (
        <div key={`bg${i}`} className="g2048-cell-bg" style={{ ...pos(Math.floor(i / SIZE), i % SIZE), width: CELL, height: CELL, position: 'absolute' }} />
      ))}
      {tiles.map(tile => (
        <div
          key={tile.id}
          className={`g2048-tile g2048-v${Math.min(tile.value, 8192)}${mergedIds.has(tile.id) ? ' g2048-pop' : ''}${tile.id === newId ? ' g2048-appear' : ''}`}
          style={{ ...pos(tile.row, tile.col), width: CELL, height: CELL, position: 'absolute', transition: `top ${SLIDE_MS}ms ease, left ${SLIDE_MS}ms ease` }}
        >
          {tile.value}
        </div>
      ))}
      {over && (
        <div className="g2048-overlay">
          <span className="g2048-overlay-text">{t('miniGameTab.game2048.gameOver')}</span>
          <button className="settings-lyrics-source-btn" type="button" onClick={newGame}>{t('miniGameTab.game2048.tryAgain')}</button>
        </div>
      )}
    </div>
  );
});
