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
 * @file AnnouncementHeader.tsx
 * @description 公告面板头部组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnnouncementData } from '../../../../api/announcement/announcementApi';

interface AnnouncementHeaderProps {
  announcement: AnnouncementData | null;
  onClose: () => void;
}

function formatDatetime(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * 渲染公告面板头部信息与关闭按钮。
 * @param props - 公告头部渲染参数。
 * @returns 公告头部区域。
 */
export function AnnouncementHeader({ announcement, onClose }: AnnouncementHeaderProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="announcement-panel-header">
      <div>
        <div className="announcement-title">{t('announcement.title', { defaultValue: '公告' })}</div>
        <div className="announcement-subtitle">{t('announcement.subtitle', { defaultValue: '当前已是最新版本，以下为最新公告内容。' })}</div>
      </div>
      <div className="announcement-header-actions">
        {announcement && (
          <div className="announcement-meta-vertical">
            <span className="announcement-meta-title">{announcement.title || t('announcement.defaultTitle', { defaultValue: '系统公告' })}</span>
            {announcement.updatedAt && (
              <span className="announcement-meta-time">{t('announcement.updatedAt', { defaultValue: '更新时间：{{time}}', time: formatDatetime(announcement.updatedAt) })}</span>
            )}
          </div>
        )}
        <button type="button" className="announcement-close-btn" onClick={onClose}>
          {t('announcement.close', { defaultValue: '关闭' })}
        </button>
      </div>
    </div>
  );
}
