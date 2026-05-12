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
 * @file MiniIsland.tsx
 * @description 迷你灵动岛演示组件
 * @author 鸡哥
 */

import React, { useEffect, useRef, useState } from 'react';
import type { MiniIslandDemo } from '../config/guideContentConfig';

/** 迷你灵动岛演示组件 */
export function MiniIsland({ demo }: { demo: MiniIslandDemo }): React.ReactElement {
  const initState = demo === 'retract' ? 'expanded' : demo === 'click' ? 'hover' : 'idle';
  const [state, setState] = useState<'idle' | 'hover' | 'expanded'>(initState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (demo !== 'scroll') return;
    const seq: Array<'idle' | 'hover' | 'expanded'> = ['idle', 'hover', 'expanded'];
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % seq.length;
      setState(seq[idx]);
    }, 1200);
    return () => clearInterval(id);
  }, [demo]);

  const handleMouseEnter = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (demo === 'hover') setState('hover');
    if (demo === 'retract') setState('expanded');
  };

  const handleMouseLeave = () => {
    if (demo === 'hover') setState('idle');
    if (demo === 'retract') {
      timerRef.current = setTimeout(() => setState('idle'), 600);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (demo === 'click') {
      setState('expanded');
      timerRef.current = setTimeout(() => setState('hover'), 1500);
    }
  };

  return (
    <div className="mini-island-wrapper">
      <div className="mini-marquee-frame marquee-active">
        <div
          className={`mini-island mini-island-${state}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}
