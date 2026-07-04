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

import { useEffect, useState } from 'react';

/** 启动画面交互逻辑 Hook */
export function useSplash() {
  const [fadeOut, setFadeOut] = useState(false);
  const [version] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('version') || '';
  });

  /** 监听主进程发送的淡出指令 */
  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on('splash:fade-out', () => {
      setFadeOut(true);
    });
    return removeListener;
  }, []);

  return { fadeOut, version };
}
