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
 * @description 股票关键词搜索面板
 * @author 鸡哥
 */

import { useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { StockSearchItem } from '../config/types';
import { formatStockPercent, formatStockPrice, getStockTrendClass } from '../utils/formatters';

interface StockSearchPanelProps {
  searching: boolean;
  searchResults: StockSearchItem[];
  onSelectSymbol: (symbol: string) => void;
  onSearch: (keyword: string) => Promise<StockSearchItem[]>;
  onClearSearchResults: () => void;
}

/**
 * 渲染股票关键词搜索候选面板。
 * @param props - 股票搜索面板属性。
 * @returns 股票搜索面板。
 */
export function StockSearchPanel(props: StockSearchPanelProps): ReactElement {
  const {
    searching,
    searchResults,
    onSelectSymbol,
    onSearch,
    onClearSearchResults,
  } = props;
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void onSearch(keyword);
  };

  const handleSelectSearchResult = (item: StockSearchItem): void => {
    setKeyword('');
    onClearSearchResults();
    onSelectSymbol(item.code);
  };

  return (
    <section className="stock-search-card" aria-label={t('stockTab.search.aria')}>
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
    </section>
  );
}