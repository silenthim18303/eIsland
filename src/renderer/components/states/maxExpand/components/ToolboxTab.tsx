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
 * @file ToolboxTab.tsx
 * @description 最大展开模式工具箱 Tab
 * @author 鸡哥
 */

import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

type ToolboxSidebarKey = 'download';

/** 最大展开模式工具箱页面 */
export function ToolboxTab(): ReactElement {
  const { t } = useTranslation();
  const [activeSidebar, setActiveSidebar] = useState<ToolboxSidebarKey>('download');

  return (
    <div className="max-expand-settings toolbox-tab-container">
      <div className="max-expand-settings-layout">
        <div className="max-expand-settings-sidebar">
          <button
            className={`max-expand-settings-sidebar-item ${activeSidebar === 'download' ? 'active' : ''}`}
            onClick={() => setActiveSidebar('download')}
            type="button"
          >
            <span className="sidebar-dot" />
            {t('maxExpand.toolbox.sidebar.download')}
          </button>
        </div>

        <div className="max-expand-settings-panel">
          {activeSidebar === 'download' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">{t('maxExpand.toolbox.download.title')}</div>
                <div className="settings-card-subtitle">{t('maxExpand.toolbox.download.subtitle')}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
