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
import { STOCK_SEARCH_KEYWORD_LOCAL_STORAGE_KEY } from '../config/stockConfig';
import type { StockFavoriteInput, StockSearchItem } from '../config/types';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import { formatStockPercent, formatStockPrice, getStockTrendClass } from '../utils/formatters';

function readPersistedKeyword(): string {
  try {
    return localStorage.getItem(STOCK_SEARCH_KEYWORD_LOCAL_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function persistKeyword(keyword: string): void {
  try {
    localStorage.setItem(STOCK_SEARCH_KEYWORD_LOCAL_STORAGE_KEY, keyword);
  } catch {
    // noop
  }
}

interface StockSearchPanelProps {
  searching: boolean;
  searchResults: StockSearchItem[];
  onSelectSymbol: (symbol: string) => void;
  onAddFavorite: (input: StockFavoriteInput) => void;
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
    onAddFavorite,
    onSearch,
    onClearSearchResults,
  } = props;
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState(readPersistedKeyword);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void onSearch(keyword);
  };

  const handleSelectSearchResult = (item: StockSearchItem): void => {
    setKeyword('');
    persistKeyword('');
    onClearSearchResults();
    onSelectSymbol(item.code);
  };

  const handleClear = (): void => {
    setKeyword('');
    persistKeyword('');
    onClearSearchResults();
  };

  const handleAddSearchResult = (item: StockSearchItem): void => {
    onAddFavorite(item);
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
            onChange={(event) => {
              const value = event.target.value;
              setKeyword(value);
              persistKeyword(value);
            }}
          />
          <button className="stock-secondary-button stock-search-btn" type="submit" disabled={searching} aria-label={t('stockTab.actions.search')}>
            <img src={SvgIcon.SEARCH} alt="" className="stock-search-btn-icon" />
          </button>
          <button className="stock-secondary-button stock-search-btn" type="button" aria-label={t('stockTab.actions.clear')} onClick={handleClear}>
            <img src={SvgIcon.DELETE} alt="" className="stock-search-btn-icon" />
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="stock-search-results">
            {searchResults.slice(0, 8).map((item) => (
              <div key={`${item.source}-${item.code}`} className="stock-search-result-item">
                <button
                  className="stock-search-result-main-button"
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
                <button
                  className="stock-search-result-add"
                  type="button"
                  aria-label={t('stockTab.actions.addFavoriteWithName', { name: item.name })}
                  onClick={() => handleAddSearchResult(item)}
                >
                  <img src={SvgIcon.PLUS} alt="" className="stock-search-result-add-icon" />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </section>
  );
}