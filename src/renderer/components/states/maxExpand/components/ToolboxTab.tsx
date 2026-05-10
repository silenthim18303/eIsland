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
import useIslandStore from '../../../../store/slices';
import { DownloadToolSection } from './tools/components/DownloadToolSection';
import { EncodingServiceToolSection } from './tools/components/EncodingServiceToolSection';
import { FileServiceToolSection } from './tools/components/FileServiceToolSection';
import { SoftwareToolSection } from './tools/components/SoftwareToolSection';
import { TranslateToolSection } from './tools/components/TranslateToolSection';
import type { ToolboxSidebarKey } from './tools/config/toolboxConfig';

const TOOLBOX_SIDEBAR_ITEMS: Array<{ key: ToolboxSidebarKey; labelKey: string }> = [
  { key: 'download', labelKey: 'maxExpand.toolbox.sidebar.download' },
  { key: 'software', labelKey: 'maxExpand.toolbox.sidebar.software' },
  { key: 'translate', labelKey: 'maxExpand.toolbox.sidebar.translate' },
  { key: 'fileService', labelKey: 'maxExpand.toolbox.sidebar.fileService' },
  { key: 'encodingService', labelKey: 'maxExpand.toolbox.sidebar.encodingService' },
];

/** 最大展开模式工具箱页面 */
export function ToolboxTab(): ReactElement {
  const { t } = useTranslation();
  const { setMaxExpandTab } = useIslandStore();
  const [activeSidebar, setActiveSidebar] = useState<ToolboxSidebarKey>('download');
  const handleSoftwareFeedbackNavigate = (): void => {
    setMaxExpandTab('settings');
    window.dispatchEvent(new CustomEvent('standalone-tab-switch', { detail: 'settings' }));
    window.dispatchEvent(new CustomEvent('settings-open-tab-intent', { detail: 'about-feedback' }));
  };

  return (
    <div className="max-expand-settings toolbox-tab-container">
      <div className="max-expand-settings-layout">
        <div className="max-expand-settings-sidebar">
          {TOOLBOX_SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`max-expand-settings-sidebar-item ${activeSidebar === item.key ? 'active' : ''}`}
              onClick={() => setActiveSidebar(item.key)}
              type="button"
            >
              <span className="sidebar-dot" />
              {t(item.labelKey)}
            </button>
          ))}
        </div>

        <div className="max-expand-settings-panel">
          {activeSidebar === 'download' && <DownloadToolSection />}
          {activeSidebar === 'translate' && <TranslateToolSection />}
          {activeSidebar === 'software' && (
            <SoftwareToolSection onFeedbackNavigate={handleSoftwareFeedbackNavigate} />
          )}
          {activeSidebar === 'fileService' && <FileServiceToolSection />}
          {activeSidebar === 'encodingService' && <EncodingServiceToolSection />}
        </div>
      </div>
    </div>
  );
}
