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
 * @file StockSidebar.tsx
 * @description 股票行情侧边栏
 * @author 鸡哥
 */

import { useMemo, useState, type KeyboardEvent, type MouseEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import type { StockFavoriteInput, StockFavoriteItem, StockMarketPeriod, StockSearchItem } from '../config/types';
import { formatStockPercent, formatStockPrice, getStockTrendClass } from '../utils/formatters';
import { StockSearchPanel } from './StockSearchPanel';

type StockSidebarTab = 'favorites' | 'search';

interface StockSidebarProps {
  symbol: string;
  searching: boolean;
  searchResults: StockSearchItem[];
  favorites: StockFavoriteItem[];
  period: StockMarketPeriod;
  onPeriodChange: (period: StockMarketPeriod) => void;
  onSelectSymbol: (symbol: string) => void;
  onAddFavorite: (input: StockFavoriteInput) => void;
  onRemoveFavorite: (symbol: string) => void;
  onSearch: (keyword: string) => Promise<StockSearchItem[]>;
  onClearSearchResults: () => void;
  onRefresh: () => void;
}

/**
 * 渲染股票自选侧边栏与搜索入口。
 * @param props - 股票侧边栏属性。
 * @returns 股票侧边栏。
 */
export function StockSidebar(props: StockSidebarProps): ReactElement {
  const {
    symbol,
    searching,
    searchResults,
    favorites,
    period,
    onPeriodChange,
    onSelectSymbol,
    onAddFavorite,
    onRemoveFavorite,
    onSearch,
    onClearSearchResults,
    onRefresh,
  } = props;
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<StockSidebarTab>('favorites');
  const [favoriteKeyword, setFavoriteKeyword] = useState('');
  const [favoriteDeleteMode, setFavoriteDeleteMode] = useState(false);
  const [selectedFavoriteCodes, setSelectedFavoriteCodes] = useState<string[]>([]);
  const filteredFavorites = useMemo(() => {
    const keyword = favoriteKeyword.trim().toLowerCase();
    if (!keyword) return favorites;
    return favorites.filter((item) =>
      item.name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword)
    );
  }, [favoriteKeyword, favorites]);
  const selectedFavoriteCount = selectedFavoriteCodes.length;
  const periodOptions: StockMarketPeriod[] = ['day', 'week', 'month'];

  const openSidebarTab = (tab: StockSidebarTab): void => {
    setSidebarTab(tab);
    setSidebarCollapsed(false);
    if (tab !== 'favorites') {
      setFavoriteDeleteMode(false);
      setSelectedFavoriteCodes([]);
    }
  };

  const toggleFavoriteDeleteMode = (): void => {
    setSidebarTab('favorites');
    setSidebarCollapsed(false);
    setFavoriteDeleteMode((current) => {
      if (current) {
        setSelectedFavoriteCodes([]);
      }
      return !current;
    });
  };

  const toggleFavoriteSelection = (code: string): void => {
    setSelectedFavoriteCodes((current) =>
      current.includes(code) ? current.filter((selectedCode) => selectedCode !== code) : [...current, code]
    );
  };

  const handleRemoveFavorite = (code: string): void => {
    onRemoveFavorite(code);
    setSelectedFavoriteCodes((current) => current.filter((selectedCode) => selectedCode !== code));
  };

  const handleRemoveSelectedFavorites = (): void => {
    selectedFavoriteCodes.forEach((code) => onRemoveFavorite(code));
    setSelectedFavoriteCodes([]);
  };

  const handleFavoriteClick = (item: StockFavoriteItem): void => {
    if (favoriteDeleteMode) {
      toggleFavoriteSelection(item.code);
      return;
    }
    onSelectSymbol(item.code);
  };

  const handleFavoriteKeyDown = (event: KeyboardEvent<HTMLDivElement>, item: StockFavoriteItem): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleFavoriteClick(item);
  };

  const handleFavoriteRemoveClick = (event: MouseEvent<HTMLButtonElement>, code: string): void => {
    event.stopPropagation();
    handleRemoveFavorite(code);
  };

  return (
    <>
      <nav className="stock-sidebar-nav">
        <button
          className={`stock-sidebar-nav-btn${sidebarTab === 'favorites' && !sidebarCollapsed ? ' active' : ''}`}
          type="button"
          aria-label={t('stockTab.sidebar.favorites')}
          onClick={() => openSidebarTab('favorites')}
        >
          <img src={SvgIcon.STOCK_CHOOSE} alt="" className="stock-sidebar-nav-icon stock-sidebar-nav-icon-large" />
        </button>
        <button
          className={`stock-sidebar-nav-btn stock-sidebar-nav-search-btn${sidebarTab === 'search' && !sidebarCollapsed ? ' active' : ''}`}
          type="button"
          title={t('stockTab.sidebar.search')}
          aria-label={t('stockTab.sidebar.search')}
          onClick={() => openSidebarTab('search')}
        >
          <img src={SvgIcon.SEARCH} alt="" className="stock-sidebar-nav-icon stock-sidebar-nav-icon-large" />
        </button>
        <button
          className="stock-sidebar-nav-btn"
          type="button"
          aria-label={t('stockTab.actions.refresh')}
          onClick={onRefresh}
        >
          <img src={SvgIcon.REVERT} alt="" className="stock-sidebar-nav-icon" />
        </button>
        {sidebarTab === 'favorites' &&
          periodOptions.map((item) => (
            <button
              key={item}
              className={`stock-sidebar-nav-btn stock-sidebar-period-btn${period === item ? ' active' : ''}`}
              type="button"
              aria-label={t(`stockTab.period.${item}`)}
              onClick={() => onPeriodChange(item)}
            >
              {t(`stockTab.period.short.${item}`)}
            </button>
          ))}
        {sidebarTab === 'favorites' && (
          <button
            className={`stock-sidebar-nav-btn stock-sidebar-nav-delete-btn${favoriteDeleteMode ? ' active' : ''}`}
            type="button"
            aria-label={t('stockTab.sidebar.deleteFavorite')}
            onClick={toggleFavoriteDeleteMode}
          >
            <img src={SvgIcon.DELETE} alt="" className="stock-sidebar-nav-icon" />
          </button>
        )}
        <button
          className="stock-sidebar-nav-btn stock-sidebar-nav-toggle-btn"
          type="button"
          aria-label={t('stockTab.sidebar.toggle')}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <img src={sidebarCollapsed ? SvgIcon.EXPAND : SvgIcon.COLLAPSE} alt="" className="stock-sidebar-nav-icon" />
        </button>
      </nav>

      <aside className={`stock-tab-sidebar${sidebarTab === 'search' ? ' search-mode' : ''}${favoriteDeleteMode ? ' delete-mode' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}>
        {!sidebarCollapsed && (
          <>
            {sidebarTab === 'favorites' && (
              <div className="stock-favorites-panel">
                {favorites.length === 0 ? (
                  <div className="stock-favorites-empty">{t('stockTab.sidebar.noFavorites')}</div>
                ) : (
                  <>
                    <div className="stock-favorites-search">
                      <label className="stock-field-label" htmlFor="stock-favorites-search-input">
                        {t('stockTab.sidebar.favoriteSearchLabel')}
                      </label>
                      <input
                        className="stock-input"
                        id="stock-favorites-search-input"
                        type="search"
                        value={favoriteKeyword}
                        placeholder={t('stockTab.sidebar.favoriteSearchPlaceholder')}
                        onChange={(event) => setFavoriteKeyword(event.target.value)}
                      />
                    </div>
                    {favoriteDeleteMode && (
                      <div className="stock-favorites-delete-bar">
                        <span className="stock-favorites-delete-count">
                          {t('stockTab.sidebar.selectedCount', { count: selectedFavoriteCount })}
                        </span>
                        <button
                          className="stock-favorites-delete-action"
                          type="button"
                          disabled={selectedFavoriteCount === 0}
                          onClick={handleRemoveSelectedFavorites}
                        >
                          {t('stockTab.sidebar.deleteSelected')}
                        </button>
                      </div>
                    )}
                    {filteredFavorites.length === 0 ? (
                      <div className="stock-favorites-empty">{t('stockTab.sidebar.noFavoriteMatches')}</div>
                    ) : (
                      <div className="stock-favorites-list">
                        {filteredFavorites.map((item) => {
                          const selected = selectedFavoriteCodes.includes(item.code);
                          return (
                            <div
                              key={item.code}
                              className={`stock-favorite-item${item.code === symbol ? ' active' : ''}${favoriteDeleteMode ? ' delete-mode' : ''}${selected ? ' selected' : ''}`}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleFavoriteClick(item)}
                              onKeyDown={(event) => handleFavoriteKeyDown(event, item)}
                            >
                              {favoriteDeleteMode && (
                                <span className={`stock-favorite-checkbox${selected ? ' checked' : ''}`} aria-hidden="true" />
                              )}
                              <div className="stock-favorite-main">
                                <span className="stock-favorite-name">{item.name}</span>
                                <span className="stock-favorite-code">{item.code}</span>
                              </div>
                              <div className="stock-favorite-price-col">
                                <span className={`stock-favorite-current-price ${getStockTrendClass(item.changePercent)}`}>
                                  {formatStockPrice(item.price)}
                                </span>
                                <span className={`stock-favorite-change-pill ${getStockTrendClass(item.changePercent)}`}>
                                  {formatStockPercent(item.changePercent)}
                                </span>
                              </div>
                              {favoriteDeleteMode && (
                                <button
                                  className="stock-favorite-remove"
                                  type="button"
                                  aria-label={t('stockTab.actions.removeFavorite', { name: item.name })}
                                  onClick={(event) => handleFavoriteRemoveClick(event, item.code)}
                                >
                                  <img src={SvgIcon.DELETE} alt="" className="stock-favorite-remove-icon" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {sidebarTab === 'search' && (
              <StockSearchPanel
                searching={searching}
                searchResults={searchResults}
                favorites={favorites}
                onSelectSymbol={onSelectSymbol}
                onAddFavorite={onAddFavorite}
                onRemoveFavorite={onRemoveFavorite}
                onSearch={onSearch}
                onClearSearchResults={onClearSearchResults}
              />
            )}
          </>
        )}
      </aside>
    </>
  );
}