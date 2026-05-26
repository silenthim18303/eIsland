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
 * @file useClickOutside.ts
 * @description 通用外部点击监听 Hook。
 * @author 鸡哥
 */

import { useEffect, type RefObject } from 'react';

/**
 * 监听文档点击，当事件目标不在给定引用元素内时触发回调。
 * @param refs 需要排除的元素引用集合。
 * @param onOutside 触发外部点击时执行的回调。
 * @param enabled 是否启用监听。
 * @returns 无返回值。
 */
export function useClickOutside(
  refs: ReadonlyArray<RefObject<HTMLElement | null>>,
  onOutside: () => void,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleMouseDown = (event: MouseEvent): void => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      const isInside = refs.some((ref) => {
        const element = ref.current;
        return Boolean(element?.contains(target));
      });
      if (!isInside) {
        onOutside();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [enabled, onOutside, refs]);
}
