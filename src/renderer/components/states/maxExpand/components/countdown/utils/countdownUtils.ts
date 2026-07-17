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
 * @file countdownUtils.ts
 * @description 倒数日模块纯工具函数。
 * @author 鸡哥
 */

/** 判断 src 是否可直接用于 <img> 渲染 */
export function isRenderableImageSource(src: string): boolean {
  return src.startsWith('data:')
    || src.startsWith('http://')
    || src.startsWith('https://')
    || src.startsWith('file://')
    || src.startsWith('blob:')
    || src.startsWith('/');
}

/** 将图片路径标准化为可渲染的 data URL 或原始 URL */
export async function normalizeImageSource(src: string | undefined): Promise<string | undefined> {
  if (!src) return undefined;
  if (isRenderableImageSource(src)) return src;
  const dataUrl = await window.api.loadWallpaperFile(src).catch(() => null);
  return dataUrl || src;
}

/** Date 转本地日期字符串 YYYY-MM-DD */
export function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 计算目标日期与今天的天数差 */
export function diffDays(targetStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
