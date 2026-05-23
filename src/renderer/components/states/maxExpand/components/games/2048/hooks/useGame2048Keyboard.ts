import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { Dir } from '../config/types';

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
