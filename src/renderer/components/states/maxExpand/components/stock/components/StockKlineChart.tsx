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

interface StockKlineChartProps {
  quote: StockQuote | null;
  klines: StockKlinePoint[];
  loading: boolean;
}

function isLightTheme(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.theme === 'light' || document.body.dataset.theme === 'light';
}

/**
 * 渲染带成交量、范围选择器和十字光标的 Highcharts Stock K 线图。
 * @param props - K 线图表属性。
 * @returns 股票 K 线图。
 */
export function StockKlineChart({ quote, klines, loading }: StockKlineChartProps): ReactElement {
  const { t } = useTranslation();

  const options = useMemo<Highcharts.Options>(() => {
    const light = isLightTheme();
    const textColor = light ? '#1f2937' : '#f8fafc';
    const mutedColor = light ? '#64748b' : '#94a3b8';
    const gridColor = light ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.18)';
    const backgroundColor = light ? 'rgba(255, 255, 255, 0.82)' : 'rgba(15, 23, 42, 0.42)';
    const candlestickData = klines.map((item) => [item.timestamp, item.open, item.high, item.low, item.close]);
    const volumeData = klines.map((item) => [item.timestamp, item.volume ?? 0]);

    return {
      chart: {
        backgroundColor,
        borderRadius: 18,
        height: 430,
        style: { fontFamily: 'inherit' },
      },
      title: {
        text: quote ? `${quote.name} · ${quote.code}` : t('stockTab.chart.title'),
        align: 'left',
        style: { color: textColor, fontSize: '15px', fontWeight: '700' },
      },
      credits: { enabled: false },
      exporting: { enabled: true },
      rangeSelector: {
        selected: 1,
        inputEnabled: false,
        buttonTheme: {
          fill: light ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.75)',
          stroke: gridColor,
          style: { color: textColor },
          states: {
            hover: { fill: 'rgba(239, 94, 166, 0.16)' },
            select: { fill: '#ef5ea6', style: { color: '#fff' } },
          },
        },
        labelStyle: { color: mutedColor },
        buttons: [
          { type: 'month', count: 1, text: t('stockTab.chart.range.1m') },
          { type: 'month', count: 3, text: t('stockTab.chart.range.3m') },
          { type: 'month', count: 6, text: t('stockTab.chart.range.6m') },
          { type: 'year', count: 1, text: t('stockTab.chart.range.1y') },
          { type: 'all', text: t('stockTab.chart.range.all') },
        ],
      },
      navigator: {
        enabled: true,
        outlineColor: gridColor,
        handles: { backgroundColor: light ? '#fff' : '#1e293b', borderColor: '#ef5ea6' },
      },
      scrollbar: { enabled: true, barBackgroundColor: 'rgba(239, 94, 166, 0.32)', trackBackgroundColor: 'rgba(148, 163, 184, 0.14)' },
      legend: { enabled: true, itemStyle: { color: textColor }, itemHoverStyle: { color: '#ef5ea6' } },
      xAxis: {
        crosshair: { color: '#ef5ea6', dashStyle: 'ShortDot' },
        lineColor: gridColor,
        tickColor: gridColor,
        labels: { style: { color: mutedColor } },
      },
      yAxis: [
        {
          labels: { align: 'right', x: -3, style: { color: mutedColor } },
          title: { text: t('stockTab.chart.priceAxis'), style: { color: mutedColor } },
          height: '68%',
          lineColor: gridColor,
          resize: { enabled: true },
          gridLineColor: gridColor,
          crosshair: { color: '#ef5ea6', dashStyle: 'ShortDot' },
        },
        {
          labels: { align: 'right', x: -3, style: { color: mutedColor } },
          title: { text: t('stockTab.chart.volumeAxis'), style: { color: mutedColor } },
          top: '73%',
          height: '27%',
          offset: 0,
          lineColor: gridColor,
          gridLineColor: gridColor,
        },
      ],
      tooltip: {
        split: true,
        backgroundColor: light ? 'rgba(255, 255, 255, 0.96)' : 'rgba(15, 23, 42, 0.96)',
        borderColor: 'rgba(239, 94, 166, 0.36)',
        style: { color: textColor },
        valueDecimals: 2,
      },
      plotOptions: {
        candlestick: {
          color: '#22c55e',
          upColor: '#ef4444',
          lineColor: '#16a34a',
          upLineColor: '#dc2626',
        },
        column: { color: 'rgba(239, 94, 166, 0.42)' },
        series: { dataGrouping: { enabled: true } },
      },
      series: [
        {
          type: 'candlestick',
          name: t('stockTab.chart.candlestick'),
          data: candlestickData,
          id: 'stock-price',
          tooltip: { valueDecimals: 2 },
        },
        {
          type: 'column',
          name: t('stockTab.chart.volume'),
          data: volumeData,
          yAxis: 1,
          tooltip: { valueDecimals: 0 },
        },
      ],
      lang: {
        noData: loading ? t('stockTab.loading.chart') : t('stockTab.empty.chart'),
        contextButtonTitle: t('stockTab.chart.exportMenu'),
      },
      noData: { style: { color: mutedColor, fontWeight: '500' } },
    };
  }, [klines, loading, quote, t]);

  return (
    <section className="stock-chart-card" aria-label={t('stockTab.chart.aria')}>
      <HighchartsReact highcharts={Highcharts} constructorType="stockChart" options={options} />
    </section>
  );
}