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
 * @file StockMetrics.tsx
 * @description 股票行情关键指标展示组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { StockQuote } from '../config/types';
import {
  formatStockChange,
  formatStockPercent,
  formatStockPrice,
  formatStockVolume,
  getStockTrendClass,
} from '../utils/formatters';

interface StockMetricsProps {
  quote: StockQuote | null;
}

/**
 * 渲染股票价格、涨跌幅、成交量等核心指标。
 * @param props - 股票指标属性。
 * @returns 股票指标卡片。
 */
export function StockMetrics({ quote }: StockMetricsProps): ReactElement {
  const { t } = useTranslation();
  const trendClass = getStockTrendClass(quote?.changePercent);
  const metrics = [
    { key: 'previousClose', label: t('stockTab.metrics.previousClose'), value: formatStockPrice(quote?.previousClose) },
    { key: 'high', label: t('stockTab.metrics.high'), value: formatStockPrice(quote?.high) },
    { key: 'low', label: t('stockTab.metrics.low'), value: formatStockPrice(quote?.low) },
    { key: 'volume', label: t('stockTab.metrics.volume'), value: formatStockVolume(quote?.volume) },
    { key: 'amount', label: t('stockTab.metrics.amount'), value: formatStockVolume(quote?.amount) },
    { key: 'source', label: t('stockTab.metrics.source'), value: quote?.source ?? '--' },
  ];

  return (
    <section className="stock-metrics-card" aria-label={t('stockTab.metrics.aria')}>
      <div className="stock-price-row">
        <span className={`stock-current-price ${trendClass}`}>{formatStockPrice(quote?.price)}</span>
        <span className={`stock-change-pill ${trendClass}`}>
          {formatStockChange(quote?.change)} · {formatStockPercent(quote?.changePercent)}
        </span>
      </div>

      <div className="stock-metric-grid">
        {metrics.map((item) => (
          <div key={item.key} className="stock-metric-item">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}