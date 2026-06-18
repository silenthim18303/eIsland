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
 * @file StockSearchPanel.tsx
 * @description 股票行情搜索与周期控制面板
 * @author 鸡哥
 */

import { useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { STOCK_PERIODS, STOCK_SYMBOL_PATTERN } from '../config/stockConfig';
import type { StockMarketPeriod, StockSearchItem } from '../config/types';
import { formatStockPercent, formatStockPrice, getStockTrendClass } from '../utils/formatters';

interface StockSearchPanelProps {
  symbol: string;
  period: StockMarketPeriod;
  loading: boolean;
  searching: boolean;
  searchResults: StockSearchItem[];
  onSelectSymbol: (symbol: string) => void;
  onPeriodChange: (period: StockMarketPeriod) => void;
  onRefresh: () => void;
  onSearch: (keyword: string) => Promise<StockSearchItem[]>;
  onClearSearchResults: () => void;
}

/**
 * 渲染股票代码输入、搜索候选与 K 线周期控制。
 * @param props - 股票搜索面板属性。
 * @returns 股票搜索控制面板。
 */
export function StockSearchPanel(props: StockSearchPanelProps): ReactElement {
  const {
    symbol,
    period,
    loading,
    searching,
    searchResults,
    onSelectSymbol,
    onPeriodChange,
    onRefresh,
    onSearch,
    onClearSearchResults,
  } = props;
  const { t } = useTranslation();
  const [symbolInput, setSymbolInput] = useState(symbol);
  const [keyword, setKeyword] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSymbolSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextSymbol = symbolInput.trim().toUpperCase();
    if (!STOCK_SYMBOL_PATTERN.test(nextSymbol)) {
      setInputError(t('stockTab.error.symbolFormat'));
      return;
    }
    setInputError(null);
    onSelectSymbol(nextSymbol);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void onSearch(keyword);
  };

  const handleSelectSearchResult = (item: StockSearchItem): void => {
    setSymbolInput(item.code);
    setKeyword('');
    setInputError(null);
    onClearSearchResults();
    onSelectSymbol(item.code);
  };

  return (
    <section className="stock-search-card" aria-label={t('stockTab.search.aria')}>
      <div className="stock-search-row">
        <form className="stock-symbol-form" onSubmit={handleSymbolSubmit}>
          <label className="stock-field-label" htmlFor="stock-symbol-input">
            {t('stockTab.search.symbolLabel')}
          </label>
          <div className="stock-inline-control">
            <input
              className="stock-input"
              id="stock-symbol-input"
              type="text"
              value={symbolInput}
              placeholder={t('stockTab.search.symbolPlaceholder')}
              aria-invalid={Boolean(inputError)}
              onChange={(event) => setSymbolInput(event.target.value)}
            />
            <button className="stock-primary-button" type="submit" disabled={loading}>
              {t('stockTab.actions.load')}
            </button>
          </div>
          {inputError && <div className="stock-form-error">{inputError}</div>}
        </form>

        <form className="stock-keyword-form" onSubmit={handleSearchSubmit}>
          <label className="stock-field-label" htmlFor="stock-keyword-input">
            {t('stockTab.search.keywordLabel')}
          </label>
          <div className="stock-inline-control">
            <input
              className="stock-input"
              id="stock-keyword-input"
              type="search"
              value={keyword}
              placeholder={t('stockTab.search.keywordPlaceholder')}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <button className="stock-secondary-button" type="submit" disabled={searching}>
              {searching ? t('stockTab.actions.searching') : t('stockTab.actions.search')}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="stock-search-results">
              {searchResults.slice(0, 8).map((item) => (
                <button
                  key={`${item.source}-${item.code}`}
                  className="stock-search-result-item"
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                >
                  <span className="stock-search-result-main">
                    <strong>{item.name}</strong>
                    <span>{item.code}</span>
                  </span>
                  <span className={`stock-search-result-price ${getStockTrendClass(item.changePercent)}`}>
                    {formatStockPrice(item.price)} · {formatStockPercent(item.changePercent)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      <div className="stock-toolbar-row">
        <div className="stock-period-group" role="tablist" aria-label={t('stockTab.period.aria')}>
          {STOCK_PERIODS.map((item) => (
            <button
              key={item.value}
              className={`stock-period-button${period === item.value ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={period === item.value}
              onClick={() => onPeriodChange(item.value)}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>
        <button className="stock-secondary-button" type="button" disabled={loading} onClick={onRefresh}>
          {loading ? t('stockTab.actions.loading') : t('stockTab.actions.refresh')}
        </button>
      </div>
    </section>
  );
}