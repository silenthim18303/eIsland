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
 * @file StockKlineChart.tsx
 * @description 股票 K 线图表组件
 * @author 鸡哥
 */

import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Highcharts from 'highcharts/highstock';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';
import 'highcharts/modules/accessibility';
import 'highcharts/modules/no-data-to-display';
import HighchartsReact from 'highcharts-react-official';
import type { StockKlinePoint, StockQuote } from '../config/types';
import { buildKlineOptions } from '../config/klineChartOptions';
import { useKlineRange } from '../hooks/useKlineRange';

interface StockKlineChartProps {
  quote: StockQuote | null;
  klines: StockKlinePoint[];
  loading: boolean;
}

/**
 * 渲染带成交量、范围选择器和十字光标的 Highcharts Stock K 线图。
 * @param props - K 线图表属性。
 * @returns 股票 K 线图。
 */
export function StockKlineChart({ quote, klines, loading }: StockKlineChartProps): ReactElement {
  const { t } = useTranslation();
  const { rangeRef, handleAfterSetExtremes } = useKlineRange(quote?.code);

  const options = useMemo(
    () => buildKlineOptions({ quote, klines, loading, t, range: rangeRef.current, onAfterSetExtremes: handleAfterSetExtremes }),
    [klines, loading, quote, t, rangeRef, handleAfterSetExtremes],
  );

  return (
    <section className="stock-chart-card" aria-label={t('stockTab.chart.aria')}>
      <HighchartsReact highcharts={Highcharts} constructorType="stockChart" options={options} />
    </section>
  );
}
