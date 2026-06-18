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
 * @file useStockMarketData.ts
 * @description MaxExpand 股票行情数据状态管理
 * @author 鸡哥
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { stocks } from 'stock-api/browser';
import { DEFAULT_STOCK_SYMBOL, STOCK_AUTO_REFRESH_MS, STOCK_KLINE_COUNT } from '../config/stockConfig';
import type { StockMarketPeriod, StockMarketState, StockSearchItem } from '../config/types';
import {
  normalizeStockKlines,
  normalizeStockQuote,
  normalizeStockSearchResults,
  normalizeStockSymbol,
} from '../utils/normalizers';

interface UseStockMarketDataResult extends StockMarketState {
  setPeriod: (period: StockMarketPeriod) => void;
  selectSymbol: (symbol: string) => void;
  refresh: () => Promise<void>;
  search: (keyword: string) => Promise<StockSearchItem[]>;
  clearSearchResults: () => void;
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'stockTab.error.default';
}

/**
 * 管理股票行情、K 线、搜索与自动刷新状态。
 * @returns 股票行情页面状态与操作入口。
 */
export function useStockMarketData(): UseStockMarketDataResult {
  const [state, setState] = useState<StockMarketState>({
    symbol: DEFAULT_STOCK_SYMBOL,
    period: 'day',
    quote: null,
    klines: [],
    searchResults: [],
    loading: false,
    searching: false,
    error: null,
    lastUpdatedAt: null,
  });
  const requestIdRef = useRef(0);

  const fetchMarketData = useCallback(async (symbol: string, period: StockMarketPeriod): Promise<void> => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const normalizedSymbol = normalizeStockSymbol(symbol);
    setState((current) => ({ ...current, symbol: normalizedSymbol, period, loading: true, error: null }));

    try {
      const [quoteRaw, klineRows] = await Promise.all([
        stocks.auto.getStock(normalizedSymbol),
        stocks.auto.getKlines(normalizedSymbol, { period, count: STOCK_KLINE_COUNT }),
      ]);
      if (requestId !== requestIdRef.current) return;
      setState((current) => ({
        ...current,
        symbol: normalizedSymbol,
        period,
        quote: normalizeStockQuote(quoteRaw, normalizedSymbol),
        klines: normalizeStockKlines(klineRows),
        loading: false,
        error: null,
        lastUpdatedAt: Date.now(),
      }));
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setState((current) => ({
        ...current,
        symbol: normalizedSymbol,
        period,
        loading: false,
        error: resolveErrorMessage(error),
      }));
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchMarketData(state.symbol, state.period);
  }, [fetchMarketData, state.period, state.symbol]);

  const setPeriod = useCallback((period: StockMarketPeriod): void => {
    setState((current) => ({ ...current, period }));
    void fetchMarketData(state.symbol, period);
  }, [fetchMarketData, state.symbol]);

  const selectSymbol = useCallback((symbol: string): void => {
    const normalizedSymbol = normalizeStockSymbol(symbol);
    setState((current) => ({ ...current, symbol: normalizedSymbol, searchResults: [] }));
    void fetchMarketData(normalizedSymbol, state.period);
  }, [fetchMarketData, state.period]);

  const search = useCallback(async (keyword: string): Promise<StockSearchItem[]> => {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) {
      setState((current) => ({ ...current, searchResults: [] }));
      return [];
    }

    setState((current) => ({ ...current, searching: true }));
    try {
      const rows = await stocks.auto.searchStocks(normalizedKeyword);
      const results = normalizeStockSearchResults(rows);
      setState((current) => ({ ...current, searchResults: results, searching: false }));
      return results;
    } catch {
      setState((current) => ({ ...current, searchResults: [], searching: false }));
      return [];
    }
  }, []);

  const clearSearchResults = useCallback((): void => {
    setState((current) => ({ ...current, searchResults: [] }));
  }, []);

  useEffect(() => {
    void fetchMarketData(DEFAULT_STOCK_SYMBOL, 'day');
  }, [fetchMarketData]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void fetchMarketData(state.symbol, state.period);
    }, STOCK_AUTO_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [fetchMarketData, state.period, state.symbol]);

  return {
    ...state,
    setPeriod,
    selectSymbol,
    refresh,
    search,
    clearSearchResults,
  };
}