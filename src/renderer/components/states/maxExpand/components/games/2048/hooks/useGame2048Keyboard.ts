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
 * @file useGame2048Keyboard.ts
 * @description 2048 键盘控制 Hook。
 * @author 鸡哥
 */

import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { Dir } from '../config/types';

/**
 * 监听键盘方向键并触发移动。
 */
export function useGame2048Keyboard(
  ref: RefObject<HTMLDivElement | null>,
  doMove: (dir: Dir) => void,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: KeyboardEvent): void => {
      const map: Record<string, Dir> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        doMove(dir);
      }
    };
    el.addEventListener('keydown', handler);
    el.focus();
    return () => el.removeEventListener('keydown', handler);
  }, [doMove, ref]);
}
