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
 * @file formatters.ts
 * @description 股票行情显示格式化工具
 * @author 鸡哥
 */

/**
 * 格式化价格数值。
 * @param value - 原始价格。
 * @returns 可展示的价格文本。
 */
export function formatStockPrice(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 });
}

/**
 * 格式化涨跌幅。
 * @param value - 以小数表达的涨跌幅，例如 0.012 表示 1.2%。
 * @returns 可展示的百分比文本。
 */
export function formatStockPercent(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  const signed = value > 0 ? '+' : '';
  return `${signed}${(value * 100).toFixed(2)}%`;
}

/**
 * 格式化带符号的涨跌额。
 * @param value - 原始涨跌额。
 * @returns 可展示的涨跌额文本。
 */
export function formatStockChange(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  const signed = value > 0 ? '+' : '';
  return `${signed}${value.toFixed(2)}`;
}

/**
 * 格式化成交量。
 * @param value - 原始成交量。
 * @returns 可展示的成交量文本。
 */
export function formatStockVolume(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  if (Math.abs(value) >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}亿`;
  if (Math.abs(value) >= 10_000) return `${(value / 10_000).toFixed(2)}万`;
  return value.toLocaleString();
}

/**
 * 格式化更新时间。
 * @param value - 毫秒时间戳。
 * @returns 可展示的更新时间。
 */
export function formatStockTime(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * 获取涨跌方向样式名。
 * @param value - 用于判断方向的数值。
 * @returns 方向样式名。
 */
export function getStockTrendClass(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value) || value === 0) return 'neutral';
  return value > 0 ? 'up' : 'down';
}