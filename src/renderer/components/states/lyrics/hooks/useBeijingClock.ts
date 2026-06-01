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
 * @file useBeijingClock.ts
 * @description 北京时间时钟 Hook（按分钟边界更新，避免每秒重渲染）
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';

/**
 * 维护北京时间文本，仅在分钟切换时更新。
 * @param enabled - 是否启用时钟。
 * @returns 当前北京时间文本（HH:mm 格式）。
 */
export function useBeijingClock(enabled: boolean): string {
  const [clockText, setClockText] = useState('');

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const tick = (): void => {
      const now = new Date();
      const beijing = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
      const hh = String(beijing.getHours()).padStart(2, '0');
      const mm = String(beijing.getMinutes()).padStart(2, '0');
      const nextText = `${hh}:${mm}`;
      setClockText((prev) => (prev === nextText ? prev : nextText));

      const delayToNextMinute = 60000 - (beijing.getSeconds() * 1000 + beijing.getMilliseconds());
      timer = setTimeout(tick, Math.max(50, delayToNextMinute));
    };

    tick();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [enabled]);

  return clockText;
}
