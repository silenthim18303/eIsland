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
 * @file normalizers.ts
 * @description stock-api 数据归一化工具
 * @author 鸡哥
 */

import type { StockKlinePoint, StockQuote, StockSearchItem } from '../config/types';

type StockApiQuote = {
  code?: unknown;
  name?: unknown;
  now?: unknown;
  low?: unknown;
  high?: unknown;
  percent?: unknown;
  yesterday?: unknown;
  volume?: unknown;
  amount?: unknown;
  source?: unknown;
};

type StockApiKline = {
  date?: unknown;
  open?: unknown;
  close?: unknown;
  high?: unknown;
  low?: unknown;
  volume?: unknown;
};

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function toTimestamp(date: string): number {
  const timestamp = new Date(date).getTime();
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

/**
 * 标准化股票代码输入。
 * @param symbol - 用户输入或接口返回的股票代码。
 * @returns 大写且去除空白后的股票代码。
 */
export function normalizeStockSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

/**
 * 将 stock-api 实时行情标准化为页面状态。
 * @param raw - stock-api 返回的单只股票行情。
 * @param fallbackCode - 请求时使用的股票代码。
 * @returns 页面使用的行情对象。
 */
export function normalizeStockQuote(raw: StockApiQuote, fallbackCode: string): StockQuote {
  const code = toText(raw.code, fallbackCode);
  const price = toNumber(raw.now) ?? 0;
  const previousClose = toNumber(raw.yesterday) ?? 0;
  const percent = toNumber(raw.percent) ?? (previousClose > 0 ? (price - previousClose) / previousClose : 0);

  return {
    code,
    name: toText(raw.name, code),
    price,
    previousClose,
    change: previousClose > 0 ? price - previousClose : 0,
    changePercent: percent,
    high: toNumber(raw.high) ?? price,
    low: toNumber(raw.low) ?? price,
    volume: toNumber(raw.volume),
    amount: toNumber(raw.amount),
    source: toText(raw.source, 'auto'),
    updatedAt: Date.now(),
  };
}

/**
 * 将 stock-api K 线数据标准化为图表序列。
 * @param rows - stock-api 返回的 K 线数组。
 * @returns 按时间升序排列的 K 线点位。
 */
export function normalizeStockKlines(rows: StockApiKline[]): StockKlinePoint[] {
  return rows
    .map((row) => {
      const date = toText(row.date, '');
      const open = toNumber(row.open);
      const high = toNumber(row.high);
      const low = toNumber(row.low);
      const close = toNumber(row.close);
      if (!date || open === null || high === null || low === null || close === null) return null;
      return {
        date,
        timestamp: toTimestamp(date),
        open,
        high,
        low,
        close,
        volume: toNumber(row.volume),
      } satisfies StockKlinePoint;
    })
    .filter((item): item is StockKlinePoint => item !== null)
    .sort((left, right) => left.timestamp - right.timestamp);
}

/**
 * 将搜索结果标准化为候选列表。
 * @param rows - stock-api 返回的搜索结果。
 * @returns 页面使用的搜索候选项。
 */
export function normalizeStockSearchResults(rows: StockApiQuote[]): StockSearchItem[] {
  return rows.map((row) => {
    const code = toText(row.code, '');
    return {
      code,
      name: toText(row.name, code),
      price: toNumber(row.now),
      changePercent: toNumber(row.percent),
      source: toText(row.source, 'auto'),
    };
  }).filter((item) => item.code);
}