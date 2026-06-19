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
 * @file StockAddFavoritePanel.tsx
 * @description 股票添加自选面板
 * @author 鸡哥
 */

import { useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { STOCK_PERIODS, STOCK_SYMBOL_PATTERN } from '../config/stockConfig';
import type { StockMarketPeriod } from '../config/types';

interface StockAddFavoritePanelProps {
  symbol: string;
  period: StockMarketPeriod;
  loading: boolean;
  onSelectSymbol: (symbol: string) => void;
  onPeriodChange: (period: StockMarketPeriod) => void;
  onRefresh: () => void;
}

/**
 * 渲染按股票代码添加自选的控制面板。
 * @param props - 添加自选面板属性。
 * @returns 添加自选面板。
 */
export function StockAddFavoritePanel(props: StockAddFavoritePanelProps): ReactElement {
  const { symbol, period, loading, onSelectSymbol, onPeriodChange, onRefresh } = props;
  const { t } = useTranslation();
  const [symbolInput, setSymbolInput] = useState(symbol);
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

  return (
    <section className="stock-search-card" aria-label={t('stockTab.addFavorite.aria')}>
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