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
 * @file CountdownPreview.tsx
 * @description 倒数日卡片预览面板，实时展示新建/编辑中的卡片效果。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { CountdownCard } from './CountdownCard';
import { diffDays, toLocalDateStr } from '../utils/countdownUtils';
import type { CountdownPreviewProps } from '../types/countdownTypes';

/** 卡片预览面板 */
export function CountdownPreview({
  editItem, editData, editBgImage, editBgOpacity,
  newType, newColor, newName, newDesc, newBgImage, newBgOpacity,
  selectedDate,
  getEventTypeLabel, formatDayText,
}: CountdownPreviewProps): ReactElement {
  const { t } = useTranslation();

  if (editItem) {
    const color = editData.color || editItem.color;
    const type = editData.type || editItem.type;
    const name = (editData.name || '').trim() || editItem.name;
    const desc = (editData.description || '').trim() || undefined;
    const days = diffDays(editItem.date);

    return (
      <div className="cd-preview">
        <div className="cd-preview-label">{t('countdown.preview', { defaultValue: '预览' })}</div>
        <CountdownCard
          item={editItem}
          color={color}
          type={type}
          name={name}
          description={desc}
          backgroundImage={editBgImage}
          backgroundOpacity={editBgOpacity}
          dateText={editItem.date}
          daysText={formatDayText(days)}
          getEventTypeLabel={getEventTypeLabel}
        />
      </div>
    );
  }

  const dateText = selectedDate ? toLocalDateStr(selectedDate) : t('countdown.datePlaceholder', { defaultValue: 'YYYY-MM-DD' });
  const daysText = selectedDate
    ? (() => { const d = diffDays(toLocalDateStr(selectedDate)); return formatDayText(d); })()
    : t('countdown.days.placeholder', { defaultValue: '-- 天' });

  return (
    <div className="cd-preview">
      <div className="cd-preview-label">{t('countdown.preview', { defaultValue: '预览' })}</div>
      <CountdownCard
        item={{ id: 0, name: '', date: '', color: newColor, type: newType }}
        color={newColor}
        type={newType}
        name={newName.trim() || t('countdown.namePlaceholder', { defaultValue: '事件名称' })}
        description={newDesc.trim() || undefined}
        backgroundImage={newBgImage}
        backgroundOpacity={newBgOpacity}
        dateText={dateText}
        daysText={daysText}
        getEventTypeLabel={getEventTypeLabel}
      />
    </div>
  );
}
