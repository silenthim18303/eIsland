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
 * @file useSmtcAccentColor.ts
 * @description 订阅 SMTC 封面主色，返回归一化 RGB（供着色器使用）
 * @author 鸡哥
 */

import { useState, useEffect } from 'react';
import { runtime } from '../utils/smtcStore';
import { ensureInitialized } from '../utils/smtcActions';
import { DEFAULT_ACCENT_COLOR } from '../../../WaveEffect/hooks/useWaveRenderer';

/**
 * SMTC 强调色 Hook
 * @description 订阅封面主色变化，返回归一化 RGB 值
 */
export function useSmtcAccentColor(): [number, number, number] {
  const [accent, setAccent] = useState<[number, number, number]>(DEFAULT_ACCENT_COLOR);

  useEffect(() => {
    const listener = (): void => {
      const [r, g, b] = runtime.dominantColor;
      // 0-255 → 0-1，全黑时回退默认色
      if (r === 0 && g === 0 && b === 0) {
        setAccent(DEFAULT_ACCENT_COLOR);
      } else {
        setAccent([r / 255, g / 255, b / 255]);
      }
    };
    runtime.listeners.add(listener);
    ensureInitialized();
    // 立即同步一次
    listener();
    return () => { runtime.listeners.delete(listener); };
  }, []);

  return accent;
}
