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
 * @file types.ts
 * @description MaxExpand 股票行情模块类型定义
 * @author 鸡哥
 */

export type StockMarketPeriod = 'day' | 'week' | 'month';

export interface StockQuote {
  code: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number | null;
  amount: number | null;
  source: string;
  updatedAt: number;
}

export interface StockKlinePoint {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface StockSearchItem {
  code: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  source: string;
}

export interface StockMarketState {
  symbol: string;
  period: StockMarketPeriod;
  quote: StockQuote | null;
  klines: StockKlinePoint[];
  searchResults: StockSearchItem[];
  loading: boolean;
  searching: boolean;
  error: string | null;
  lastUpdatedAt: number | null;
}