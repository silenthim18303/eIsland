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
 * @file stockConfig.ts
 * @description MaxExpand 股票行情模块配置
 * @author 鸡哥
 */

export const DEFAULT_STOCK_SYMBOL = 'SH600519';
export const STOCK_AUTO_REFRESH_MS = 30_000;
export const STOCK_KLINE_COUNT = 160;
export const STOCK_FAVORITES_STORE_KEY = 'stock-favorites';
export const STOCK_FAVORITES_LOCAL_STORAGE_KEY = 'eIsland_stock_favorites';

export const STOCK_SYMBOL_PATTERN = /^(SH|SZ|HK|US)[A-Z0-9]{2,10}$/i;