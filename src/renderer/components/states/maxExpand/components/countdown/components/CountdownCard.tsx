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
 * @file CountdownCard.tsx
 * @description 倒数日卡片组件，用于预览和列表展示。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import type { CountdownCardProps } from '../types/countdownTypes';

/** 单个倒数日卡片 */
export function CountdownCard({
  color, type, name, description,
  backgroundImage, backgroundOpacity,
  dateText, daysText,
  showDelete, onDelete, onClick,
  getEventTypeLabel,
}: CountdownCardProps): ReactElement {
  return (
    <div
      className={`cd-card cd-card-${type}`}
      style={{ borderColor: color }}
      onClick={onClick}
    >
      {backgroundImage && <div className="cd-card-bg" style={{ backgroundImage: `url(${backgroundImage})`, opacity: backgroundOpacity ?? 0.5 }} />}
      <div className="cd-card-overlay" style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)` }} />
      <div className="cd-card-content">
        <div className="cd-card-top-row">
          <span className="cd-card-type-badge" style={{ background: `${color}50`, color: '#fff' }}>{getEventTypeLabel(type)}</span>
          {showDelete && onDelete && (
            <button
              className="cd-card-delete"
              onClick={onDelete}
              type="button"
            >x</button>
          )}
        </div>
        <div className="cd-card-name">{name}</div>
        {description && <div className="cd-card-desc">{description}</div>}
        <div className="cd-card-bottom">
          <span className="cd-card-date">{dateText}</span>
          <span className="cd-card-days" style={{ color }}>{daysText}</span>
        </div>
      </div>
    </div>
  );
}
