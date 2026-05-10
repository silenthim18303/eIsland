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
 * @file downloadFormatters.ts
 * @description 下载工具显示与输入辅助函数
 * @author 鸡哥
 */

/**
 * 将字节数格式化为可读文本。
 * 
 * @param value 字节数
 * @returns 格式化后的文本
 */
export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  if (value < 1024) return `${value.toFixed(0)} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * 从下载链接推断建议文件名。
 * 
 * @param url 下载链接
 * @returns 推断的文件名
 */
export function inferSuggestedName(url: string): string {
  const text = url.trim();
  if (!text) return `download-${Date.now()}.bin`;
  try {
    const parsed = new URL(text.startsWith('http://') || text.startsWith('https://') ? text : `https://${text}`);
    const name = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '');
    return name || `download-${Date.now()}.bin`;
  } catch {
    return `download-${Date.now()}.bin`;
  }
}

/**
 * 将毫秒时长格式化为时分秒文本。
 */
export function formatDurationMs(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '-';
  const totalSeconds = Math.max(0, Math.floor(value / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
