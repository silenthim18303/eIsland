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
 * @file klineChartOptions.ts
 * @description K 线图 Highcharts options 构造器
 * @author 鸡哥
 */

import type Highcharts from 'highcharts/highstock';
import type { StockKlinePoint, StockQuote } from './types';
import { isLightTheme } from '../utils/theme';

interface BuildKlineOptionsParams {
  quote: StockQuote | null;
  klines: StockKlinePoint[];
  loading: boolean;
  t: (key: string) => string;
  range: { min: number; max: number } | null;
  onAfterSetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => void;
}

/**
 * 构建 K 线图的 Highcharts options。
 * @param params - 图表参数。
 * @returns Highcharts 配置对象。
 */
export function buildKlineOptions({
  quote,
  klines,
  loading,
  t,
  range,
  onAfterSetExtremes,
}: BuildKlineOptionsParams): Highcharts.Options {
  const light = isLightTheme();
  const textColor = light ? '#1f2937' : '#f8fafc';
  const mutedColor = light ? '#64748b' : '#94a3b8';
  const gridColor = light ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.18)';
  const backgroundColor = light ? 'rgba(255, 255, 255, 0)' : 'rgba(15, 23, 42, 0)';
  const accentColor = 'rgba(100, 181, 246, 0.14)';
  const accentBorderColor = 'rgba(100, 181, 246, 0.28)';
  const accentStrongColor = 'rgba(100, 181, 246, 0.48)';
  const candlestickData = klines.map((item) => [item.timestamp, item.open, item.high, item.low, item.close]);
  const volumeData = klines.map((item) => [item.timestamp, item.volume ?? 0]);

  return {
    chart: {
      backgroundColor,
      borderRadius: 18,
      height: 430,
      style: { fontFamily: 'inherit' },
    },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    rangeSelector: {
      selected: 1,
      inputEnabled: false,
      buttonTheme: {
        fill: light ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.75)',
        stroke: gridColor,
        style: { color: textColor },
        states: {
          hover: { fill: accentColor },
          select: { fill: accentColor, stroke: accentStrongColor, style: { color: textColor } },
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
      maskFill: 'rgba(0, 0, 0, 0.6)',
      handles: { backgroundColor: light ? '#fff' : '#1e293b', borderColor: accentStrongColor },
    },
    scrollbar: { enabled: true, barBackgroundColor: accentBorderColor, trackBackgroundColor: 'rgba(148, 163, 184, 0.14)' },
    legend: { enabled: true, itemStyle: { color: textColor }, itemHoverStyle: { color: accentStrongColor } },
    xAxis: {
      crosshair: { color: accentStrongColor, dashStyle: 'ShortDot' },
      lineColor: gridColor,
      tickColor: gridColor,
      labels: { style: { color: mutedColor } },
      events: { afterSetExtremes: onAfterSetExtremes },
      ...(range ? { min: range.min, max: range.max } : {}),
    },
    yAxis: [
      {
        labels: { align: 'right', x: -3, style: { color: mutedColor } },
        title: { text: t('stockTab.chart.priceAxis'), style: { color: mutedColor } },
        height: '68%',
        lineColor: gridColor,
        resize: { enabled: true },
        gridLineColor: gridColor,
        crosshair: { color: accentStrongColor, dashStyle: 'ShortDot' },
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
      borderColor: accentBorderColor,
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
      column: { color: accentBorderColor },
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
}
