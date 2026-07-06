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
 * @file useMarqueeOverflow.ts
 * @description 检测文本溢出距离，返回滚动所需的像素偏移量
 * @author 鸡哥
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import type { RefObject, ReactNode } from 'react';

/** useMarqueeOverflow 返回值 */
export interface UseMarqueeOverflowReturn {
  /** 容器 ref */
  containerRef: RefObject<HTMLDivElement | null>;
  /** 文本 ref */
  textRef: RefObject<HTMLSpanElement | null>;
  /** 溢出距离（px），0 表示无溢出 */
  distance: number;
}

/**
 * 文本溢出检测 Hook
 * @description 监测容器与文本宽度差，返回溢出像素值
 * @param children - 监听内容变化的子节点
 */
export function useMarqueeOverflow(children: ReactNode): UseMarqueeOverflowReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);

  const checkOverflow = useCallback((): void => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) {
      setDistance(0);
      return;
    }
    const diff = text.scrollWidth - container.clientWidth;
    setDistance(diff > 0 ? diff : 0);
  }, []);

  useEffect(() => {
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { observer.disconnect(); };
  }, [checkOverflow, children]);

  return { containerRef, textRef, distance };
}
