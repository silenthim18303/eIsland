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
 */

/**
 * @file favoriteStorage.ts
 * @description 股票自选列表存储与校验
 * @author 鸡哥
 */

import { STOCK_FAVORITES_LOCAL_STORAGE_KEY, STOCK_FAVORITES_STORE_KEY } from '../config/stockConfig';
import type { StockFavoriteInput, StockFavoriteItem } from '../config/types';
import { normalizeStockSymbol } from './normalizers';

function readText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * 清洗持久化中的股票自选列表。
 * @param data - 待校验的存储数据。
 * @returns 可安全渲染的自选股列表。
 */
export function sanitizeStockFavorites(data: unknown): StockFavoriteItem[] {
  if (!Array.isArray(data)) return [];
  const visited = new Set<string>();
  return data.reduce<StockFavoriteItem[]>((items, row) => {
    if (!row || typeof row !== 'object') return items;
    const record = row as Record<string, unknown>;
    const code = normalizeStockSymbol(readText(record.code));
    if (!code || visited.has(code)) return items;
    visited.add(code);
    items.push({
      code,
      name: readText(record.name) || code,
      price: readNullableNumber(record.price),
      changePercent: readNullableNumber(record.changePercent),
      source: readText(record.source) || 'auto',
      addedAt: readNullableNumber(record.addedAt) ?? Date.now(),
    });
    return items;
  }, []);
}

/**
 * 合成股票自选项，重复添加时保留原添加时间。
 * @param input - 添加自选所需的股票信息。
 * @param previous - 已存在的同代码自选项。
 * @returns 标准化后的自选项。
 */
export function createStockFavorite(input: StockFavoriteInput, previous?: StockFavoriteItem): StockFavoriteItem {
  const code = normalizeStockSymbol(input.code);
  return {
    code,
    name: input.name?.trim() || previous?.name || code,
    price: input.price ?? previous?.price ?? null,
    changePercent: input.changePercent ?? previous?.changePercent ?? null,
    source: input.source?.trim() || previous?.source || 'auto',
    addedAt: previous?.addedAt ?? Date.now(),
  };
}

/**
 * 持久化股票自选列表。
 * @param items - 当前自选股列表。
 */
export function persistStockFavorites(items: StockFavoriteItem[]): void {
  try {
    localStorage.setItem(STOCK_FAVORITES_LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // noop
  }
  window.api.storeWrite(STOCK_FAVORITES_STORE_KEY, items).catch(() => {});
}

/**
 * 读取股票自选列表，优先使用主进程 store，兼容旧 localStorage 数据。
 * @returns 已清洗的自选股列表。
 */
export async function readStockFavorites(): Promise<StockFavoriteItem[]> {
  try {
    const stored = await window.api.storeRead(STOCK_FAVORITES_STORE_KEY);
    const items = sanitizeStockFavorites(stored);
    if (items.length > 0) return items;
  } catch {
    // noop
  }

  try {
    const raw = localStorage.getItem(STOCK_FAVORITES_LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const items = sanitizeStockFavorites(JSON.parse(raw) as unknown);
    if (items.length > 0) persistStockFavorites(items);
    return items;
  } catch {
    return [];
  }
}