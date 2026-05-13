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
 * @file GuideInteractivePage.tsx
 * @description 引导页互动卡片子组件
 * @author 鸡哥
 */

import type { ReactElement, WheelEvent } from 'react';
import { SvgIcon } from '../../../../utils/SvgIcon';

interface DisplayCard {
  iconSrc: string;
  title: string;
  desc: string;
}

interface GuideInteractivePageProps {
  page: number;
  cards: DisplayCard[];
  cardIndex: number;
  hint: string;
  animDir: 'up' | 'down';
  onWheel: (event: WheelEvent) => void;
  renderMini: (safeIndex: number) => ReactElement;
}

/**
 * 渲染引导页互动卡片内容。
 * @param props - 互动卡片页面参数。
 * @returns 互动卡片页面。
 */
export function GuideInteractivePage({
  page,
  cards,
  cardIndex,
  hint,
  animDir,
  onWheel,
  renderMini,
}: GuideInteractivePageProps): ReactElement {
  const safeIdx = Math.min(cardIndex, cards.length - 1);
  const card = cards[safeIdx];

  return (
    <div className="guide-page guide-page-interactive" key={`page-${page}`}>
      <div className="guide-interact-zone" onWheel={onWheel}>
        <span className="guide-interact-hint">{hint}</span>
        <div className="guide-interact-dots">
          {cards.map((_, i) => (
            <span
              key={i}
              className={`guide-interact-dot${cardIndex === i ? ' active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div
        className={`guide-interact-card ${animDir === 'down' ? 'guide-slide-up' : 'guide-slide-down'}`}
        key={`card-${cardIndex}`}
      >
        <div className="guide-interact-card-text">
          <img className={`guide-interact-icon${card.iconSrc === SvgIcon.POMODORO ? ' no-invert' : ''}`} src={card.iconSrc} alt="" aria-hidden="true" />
          <div className="guide-title">{card.title}</div>
          <div className="guide-desc">{card.desc}</div>
        </div>
        {renderMini(safeIdx)}
      </div>
    </div>
  );
}
