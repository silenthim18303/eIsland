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
 * @file NetworkServiceToolSection.tsx
 * @description 工具箱网络服务模块（留空占位）
 * @author 鸡哥
 */

import { useTranslation } from 'react-i18next';
import type { ReactElement } from 'react';

export function NetworkServiceToolSection(): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="settings-cards">
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-title">{t('maxExpand.toolbox.networkService.title')}</div>
          <div className="settings-card-subtitle">{t('maxExpand.toolbox.networkService.subtitle')}</div>
        </div>
        <div className="settings-card-body" />
      </div>
    </div>
  );
}
