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
 * @file GuideFooter.tsx
 * @description 引导页底部导航与操作按钮组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import type { TFunction } from 'i18next';

interface GuideFooterProps {
  t: TFunction;
  page: number;
  isLast: boolean;
  pageCount: number;
  onSelectPage: (index: number) => void;
  onFinish: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function GuideFooter({
  t,
  page,
  isLast,
  pageCount,
  onSelectPage,
  onFinish,
  onPrev,
  onNext,
}: GuideFooterProps): ReactElement {
  return (
    <div className="guide-footer">
      <div className="guide-nav-dots">
        {Array.from({ length: pageCount }).map((_, i) => (
          <button
            type="button"
            key={i}
            className={`guide-nav-dot ${page === i ? 'active' : ''}`}
            onClick={() => onSelectPage(i)}
            aria-label={t('guide.nav.pageAria', { defaultValue: '第 {{index}} 页', index: i + 1 })}
          />
        ))}
      </div>

      <div className="guide-actions">
        {!isLast && (
          <button type="button" className="guide-btn guide-btn-secondary" onClick={onFinish}>
            {t('guide.actions.skip', { defaultValue: '跳过引导' })}
          </button>
        )}

        {page > 0 && (
          <button type="button" className="guide-btn guide-btn-secondary" onClick={onPrev}>
            {t('guide.actions.prev')}
          </button>
        )}

        <button type="button" className="guide-btn guide-btn-primary" onClick={onNext}>
          {isLast ? t('guide.actions.start') : t('guide.actions.next')}
        </button>
      </div>
    </div>
  );
}
