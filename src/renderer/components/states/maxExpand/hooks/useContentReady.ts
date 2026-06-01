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
 * @file useContentReady.ts
 * @description 内容就绪状态延迟加载 Hook
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';

/**
 * 延迟标记内容就绪（下一帧），避免首帧白屏。
 * @param deferContent - 是否延迟。
 * @returns 内容是否就绪。
 */
export function useContentReady(deferContent: boolean): boolean {
  const [contentReady, setContentReady] = useState(!deferContent);

  useEffect(() => {
    if (!deferContent) {
      setContentReady(true);
      return undefined;
    }
    const raf = window.requestAnimationFrame(() => setContentReady(true));
    return () => window.cancelAnimationFrame(raf);
  }, [deferContent]);

  return contentReady;
}
