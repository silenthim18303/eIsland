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
 * @file clipboardHistoryUtils.ts
 * @description 剪贴板历史模块纯工具函数。
 * @author 鸡哥
 */

import { LOCAL_STORAGE_KEY, MS_PER_DAY, MS_PER_HOUR, STORE_KEY } from '../config/clipboardHistoryConfig';
import type { ClipboardCleanupRange, ClipboardHistoryFilter, ClipboardHistoryItem } from '../types/clipboardHistoryTypes';

/** 标准化剪贴板文本（统一换行符、去首尾空白） */
export function normalizeClipboardText(text: string): string {
  return text.replace(/\r\n/g, '\n').trim();
}

/** 判断文本是否可能是 URL */
export function isLikelyUrl(text: string): boolean {
  const value = text.trim();
  if (/^https?:\/\/\S+$/i.test(value)) return true;
  if (/^www\.[^\s]+\.[^\s]+$/i.test(value)) return true;
  return /^[a-z0-9.-]+\.[a-z]{2,}(?:[/?#:]\S*)?$/i.test(value);
}

/** 判断文本是否可能是密码（不应记录） */
export function isLikelyPassword(text: string): boolean {
  const value = text.trim();
  if (value.length < 8 || value.length > 128) return false;
  if (/\s/.test(value) || isLikelyUrl(value) || /^\S+@\S+\.\S+$/.test(value)) return false;
  const groups = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((rule) => rule.test(value)).length;
  return groups >= 3;
}

/** 判断文本是否应该被记录 */
export function isRecordableClipboardText(text: string): boolean {
  return Boolean(text) && !isLikelyPassword(text);
}

/** 根据筛选条件匹配条目 */
export function matchesClipboardFilter(item: ClipboardHistoryItem, filter: ClipboardHistoryFilter): boolean {
  if (filter === 'all') return true;
  const isUrl = isLikelyUrl(item.text);
  if (filter === 'url') return isUrl;
  return !isUrl && !isLikelyPassword(item.text);
}

/** 校验并截断历史数据 */
export function sanitizeHistory(data: unknown, historyLimit: number): ClipboardHistoryItem[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      const row = item as Partial<ClipboardHistoryItem>;
      const text = typeof row.text === 'string' ? normalizeClipboardText(row.text) : '';
      if (!isRecordableClipboardText(text)) return null;
      const createdAt = typeof row.createdAt === 'number' && Number.isFinite(row.createdAt) ? row.createdAt : Date.now();
      const id = typeof row.id === 'number' && Number.isFinite(row.id) ? row.id : createdAt;
      return { id, text, createdAt };
    })
    .filter((item): item is ClipboardHistoryItem => Boolean(item))
    .slice(0, historyLimit);
}

/** 持久化历史数据（store + localStorage 兜底） */
export function persistHistory(items: ClipboardHistoryItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // noop
  }
  window.api.storeWrite(STORE_KEY, items).catch(() => {});
}

/** 获取预览文本（单行、截断） */
export function getPreviewText(text: string): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= 72) return oneLine;
  return `${oneLine.slice(0, 72)}…`;
}

/** 判断两个时间戳是否在同一天（本地时间） */
export function isSameLocalDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

/** 判断条目是否在清理时间范围内 */
export function isItemInCleanupRange(item: ClipboardHistoryItem, range: ClipboardCleanupRange, now: number): boolean {
  if (range === 'lastHour') return now - item.createdAt <= MS_PER_HOUR;
  if (range === 'today') return isSameLocalDay(new Date(item.createdAt), new Date(now));
  if (range === 'last7Days') return now - item.createdAt <= 7 * MS_PER_DAY;
  if (range === 'last30Days') return now - item.createdAt <= 30 * MS_PER_DAY;
  return now - item.createdAt > 30 * MS_PER_DAY;
}

/** 生成导出文件名 */
export function getClipboardHistoryExportFileName(now: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `eIsland-clipboard-history-${date}-${time}.json`;
}

/** 构建导出 JSON 内容 */
export function buildClipboardHistoryExport(items: ClipboardHistoryItem[], exportedAt: Date): string {
  return JSON.stringify({
    app: 'eIsland',
    type: 'clipboard-history',
    exportedAt: exportedAt.toISOString(),
    count: items.length,
    items: items.map((item) => ({
      id: item.id,
      text: item.text,
      createdAt: item.createdAt,
      createdAtText: new Date(item.createdAt).toISOString(),
    })),
  }, null, 2);
}

/** 下载文本文件 */
export function downloadTextFile(fileName: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
