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
 * @file useWheelPicker.ts
 * @description 轮盘选择器拖拽与滚动交互 Hook。
 * @author 鸡哥
 */

import { useCallback, useEffect, useRef } from 'react';
import { WHEEL_ITEM_HEIGHT } from '../config/wheelPickerConstants';

/** useWheelPicker Hook 参数 */
interface UseWheelPickerParams {
  containerRef: React.RefObject<HTMLDivElement | null>;
  items: number[];
  value: number;
  onChange: (val: number) => void;
}

/** useWheelPicker Hook 返回值 */
interface UseWheelPickerResult {
  handleMouseDown: (e: React.MouseEvent) => void;
}

/** 轮盘选择器拖拽与滚动交互 Hook */
export function useWheelPicker({
  containerRef,
  items,
  value,
  onChange,
}: UseWheelPickerParams): UseWheelPickerResult {
  const currentIdx = value - items[0]!;
  const dragStartY = useRef(0);
  const dragStartIdx = useRef(0);
  const isDragging = useRef(false);
  const lastIdxRef = useRef(currentIdx);
  lastIdxRef.current = currentIdx;

  const clampIdx = useCallback((idx: number) => Math.max(0, Math.min(items.length - 1, idx)), [items.length]);

  const scrollToIdx = useCallback((idx: number, smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    const top = idx * WHEEL_ITEM_HEIGHT;
    if (smooth) {
      el.scrollTo({ top, behavior: 'smooth' });
    } else {
      el.scrollTop = top;
    }
  }, [containerRef]);

  useEffect(() => {
    if (!isDragging.current) {
      scrollToIdx(currentIdx, false);
    }
  }, [currentIdx, scrollToIdx]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent): void => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (dir === 0) return;
      const cur = lastIdxRef.current;
      const next = clampIdx(cur + dir);
      if (next !== cur) {
        scrollToIdx(next, true);
        onChange(items[next]!);
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [items, onChange, clampIdx, scrollToIdx, containerRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartIdx.current = lastIdxRef.current;

    const handleMouseMove = (ev: MouseEvent): void => {
      const dy = dragStartY.current - ev.clientY;
      const offsetItems = Math.round(dy / WHEEL_ITEM_HEIGHT);
      const next = clampIdx(dragStartIdx.current + offsetItems);
      if (next !== lastIdxRef.current) {
        scrollToIdx(next, false);
        onChange(items[next]!);
      }
    };

    const handleMouseUp = (): void => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      scrollToIdx(lastIdxRef.current, true);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [items, onChange, clampIdx, scrollToIdx]);

  return { handleMouseDown };
}
