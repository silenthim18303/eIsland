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
 * @file AnnouncementBody.tsx
 * @description 公告面板正文组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnnouncementData } from '../../../../api/announcement/announcementApi';

interface AnnouncementBodyProps {
  loading: boolean;
  announcement: AnnouncementData | null;
}

/**
 * 渲染公告面板正文内容。
 * @param props - 公告正文渲染参数。
 * @returns 公告正文区域。
 */
export function AnnouncementBody({ loading, announcement }: AnnouncementBodyProps): ReactElement {
  const { t } = useTranslation();

  if (loading) {
    return <div className="announcement-empty">{t('announcement.loading', { defaultValue: '正在加载公告…' })}</div>;
  }

  if (!announcement) {
    return <div className="announcement-empty">{t('announcement.empty', { defaultValue: '暂无公告内容' })}</div>;
  }

  if (announcement.contentHtml) {
    return <div className="announcement-body" dangerouslySetInnerHTML={{ __html: announcement.contentHtml }} />;
  }

  return (
    <div className="announcement-body">
      <pre>{announcement.content || ''}</pre>
    </div>
  );
}
