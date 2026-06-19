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

import { useState, type KeyboardEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import type { StockFavoriteInput, StockFavoriteItem, StockSearchItem } from '../config/types';
import { formatStockPercent, formatStockPrice, getStockTrendClass } from '../utils/formatters';
import { StockSearchPanel } from './StockSearchPanel';

type StockSidebarTab = 'favorites' | 'search';

interface StockSidebarProps {
  symbol: string;
  searching: boolean;
  searchResults: StockSearchItem[];
  favorites: StockFavoriteItem[];
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

  const openSidebarTab = (tab: StockSidebarTab): void => {
    setSidebarTab(tab);
    setSidebarCollapsed(false);
  };

  const handleFavoriteKeyDown = (event: KeyboardEvent<HTMLDivElement>, item: StockFavoriteItem): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelectSymbol(item.code);
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
          <img src={SvgIcon.UPDATE} alt="" className="stock-sidebar-nav-icon" />
        </button>
        <button
          className="stock-sidebar-nav-btn"
          type="button"
          aria-label={t('stockTab.sidebar.toggle')}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <img src={sidebarCollapsed ? SvgIcon.EXPAND : SvgIcon.COLLAPSE} alt="" className="stock-sidebar-nav-icon" />
        </button>
      </nav>

      <aside className={`stock-tab-sidebar${sidebarTab === 'search' ? ' search-mode' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}>
        {!sidebarCollapsed && (
          <>
            {sidebarTab === 'favorites' && (
              <div className="stock-favorites-panel">
                {favorites.length === 0 ? (
                  <div className="stock-favorites-empty">{t('stockTab.sidebar.noFavorites')}</div>
                ) : (
                  <div className="stock-favorites-list">
                    {favorites.map((item) => (
                      <div
                        key={item.code}
                        className={`stock-favorite-item${item.code === symbol ? ' active' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectSymbol(item.code)}
                        onKeyDown={(event) => handleFavoriteKeyDown(event, item)}
                      >
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {sidebarTab === 'search' && (
              <StockSearchPanel
                searching={searching}
                searchResults={searchResults}
                onSelectSymbol={onSelectSymbol}
                onAddFavorite={onAddFavorite}
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