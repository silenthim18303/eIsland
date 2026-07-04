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
 * @file useSplash.ts
 * @description 启动画面交互逻辑 Hook
 * @author 鸡哥
 */

import { useEffect, useRef, useState } from 'react';
import { SPLASH_MIN_DISPLAY_MS } from '../config/splashConfig';

/** 启动画面交互逻辑 Hook */
export function useSplash() {
  const [fadeOut, setFadeOut] = useState(false);
  const startTimeRef = useRef(Date.now());

  /** 监听主进程发送的淡出指令，确保至少停留 SPLASH_MIN_DISPLAY_MS */
  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on('splash:fade-out', () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = SPLASH_MIN_DISPLAY_MS - elapsed;
      if (remaining > 0) {
        setTimeout(() => setFadeOut(true), remaining);
      } else {
        setFadeOut(true);
      }
    });
    return removeListener;
  }, []);

  return { fadeOut };
}
