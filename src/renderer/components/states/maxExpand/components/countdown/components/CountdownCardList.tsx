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
 * @file CountdownCardList.tsx
 * @description 倒数日卡片水平列表。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { CountdownCard } from './CountdownCard';
import { diffDays } from '../utils/countdownUtils';
import type { CountdownCardListProps } from '../types/countdownTypes';

/** 下部卡片水平列表 */
export function CountdownCardList({
  items, onStartEdit, onRemove,
  getEventTypeLabel, formatDayText,
  cardsRef, onWheel,
}: CountdownCardListProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="cd-cards-wrap" ref={cardsRef} onWheel={onWheel}>
      {items.length === 0 ? (
        <div className="cd-cards-empty">{t('countdown.empty', { defaultValue: '选择日期并添加事件' })}</div>
      ) : (
        items.map(item => {
          const days = diffDays(item.date);
          return (
            <CountdownCard
              key={item.id}
              item={item}
              color={item.color}
              type={item.type}
              name={item.name}
              description={item.description}
              backgroundImage={item.backgroundImage}
              backgroundOpacity={item.backgroundOpacity}
              dateText={item.date}
              daysText={formatDayText(days)}
              showDelete
              onDelete={(e) => { e.stopPropagation(); onRemove(item.id); }}
              onClick={() => onStartEdit(item)}
              getEventTypeLabel={getEventTypeLabel}
            />
          );
        })
      )}
    </div>
  );
}
