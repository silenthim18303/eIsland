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
 * @file StockTab.tsx
 * @description MaxExpand 股票行情分页入口
 * @author 鸡哥
 */

import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useStockMarketData } from '../hooks/useStockMarketData';
import {
  formatStockChange,
  formatStockPercent,
  formatStockPrice,
  getStockTrendClass,
} from '../utils/formatters';
import { StockKlineChart } from './StockKlineChart';
import { StockMetrics } from './StockMetrics';
import { StockSidebar } from './StockSidebar';

/**
 * 渲染 MaxExpand 股票行情分页。
 * @returns 股票行情分页。
 */
export function StockTab(): ReactElement {
  const { t } = useTranslation();
  const market = useStockMarketData();
  const trendClass = getStockTrendClass(market.quote?.changePercent);

  return (
    <div className="max-expand-settings stock-tab-container">
      <StockSidebar
        symbol={market.symbol}
        period={market.period}
        loading={market.loading}
        searching={market.searching}
        searchResults={market.searchResults}
        favorites={market.favorites}
        onSelectSymbol={market.selectSymbol}
        onAddFavorite={market.addFavorite}
        onRemoveFavorite={market.removeFavorite}
        onPeriodChange={market.setPeriod}
        onRefresh={() => { void market.refresh(); }}
        onSearch={market.search}
        onClearSearchResults={market.clearSearchResults}
      />

      <main className="stock-tab-main">
        <div className="stock-tab-main-header">
          <div>
            <div className="stock-tab-main-title">{market.quote?.name ?? t('stockTab.chart.title')}</div>
            <div className="stock-tab-main-meta">{market.quote?.code ?? market.symbol}</div>
          </div>
          <div className="stock-tab-main-status">
            <StockMetrics quote={market.quote} />
            <div className="stock-price-row">
              <div className={`stock-current-price ${trendClass}`}>
                {formatStockPrice(market.quote?.price)}
              </div>
              <span className={`stock-change-pill ${trendClass}`}>
                {formatStockChange(market.quote?.change)} · {formatStockPercent(market.quote?.changePercent)}
              </span>
            </div>
          </div>
        </div>

        {market.error && (
          <div className="stock-error-card" role="alert">
            {market.error.startsWith('stockTab.') ? t(market.error) : market.error}
          </div>
        )}

        <div className="stock-content-grid">
          <StockKlineChart quote={market.quote} klines={market.klines} loading={market.loading} />
        </div>
      </main>
    </div>
  );
}