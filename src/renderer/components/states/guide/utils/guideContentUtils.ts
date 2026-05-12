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
 * @file guideContentUtils.ts
 * @description 引导页工具函数与常量
 * @author 鸡哥
 */

export const STANDALONE_WINDOW_MODE_STORE_KEY = 'standalone-window-mode';
export const LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY = 'countdown-window-mode';
export const STANDALONE_WINDOW_ACTIVE_TAB_STORE_KEY = 'standalone-window-active-tab';
export const STANDALONE_WINDOW_AUTH_INTENT_STORE_KEY = 'standalone-window-auth-intent';

/** 从图片提取主题色 */
export function extractDominantColor(src: string): Promise<[number, number, number]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      const ctx = c.getContext('2d');
      if (!ctx) {
        resolve([100, 100, 100]);
        return;
      }
      ctx.drawImage(img, 0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      resolve([d[0], d[1], d[2]]);
    };
    img.onerror = () => resolve([100, 100, 100]);
    img.src = src;
  });
}

export async function readStandaloneWindowMode(): Promise<'integrated' | 'standalone'> {
  try {
    const mode = await window.api.storeRead(STANDALONE_WINDOW_MODE_STORE_KEY);
    if (mode === 'standalone') return 'standalone';
    if (mode === 'integrated') return 'integrated';
  } catch {
    // ignore
  }
  try {
    const legacyMode = await window.api.storeRead(LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY);
    if (legacyMode === 'standalone') return 'standalone';
  } catch {
    // ignore
  }
  return 'integrated';
}
