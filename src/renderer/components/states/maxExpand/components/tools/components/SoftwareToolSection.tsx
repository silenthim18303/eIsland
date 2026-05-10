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
 * @file SoftwareToolSection.tsx
 * @description 工具箱软件列表模块
 * @author 鸡哥
 */

import { useEffect, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchToolboxSoftwareList, type ToolboxSoftwareItem } from '../../../../../../api/tools/toolboxSoftwareApi';
import { SETTINGS_OPEN_TAB_STORE_KEY } from '../config/toolboxConfig';

interface SoftwareToolSectionProps {
  onFeedbackNavigate: () => void;
}

export function SoftwareToolSection({ onFeedbackNavigate }: SoftwareToolSectionProps): ReactElement {
  const { t } = useTranslation();
  const [softwareItems, setSoftwareItems] = useState<ToolboxSoftwareItem[]>([]);
  const [softwareLoading, setSoftwareLoading] = useState(true);

  const loadSoftware = (): void => {
    setSoftwareLoading(true);
    fetchToolboxSoftwareList()
      .then(setSoftwareItems)
      .finally(() => setSoftwareLoading(false));
  };

  useEffect(() => {
    loadSoftware();
  }, []);

  return (
    <div className="software-list">
      {softwareLoading ? (
        <div className="software-list-empty">
          <span className="software-list-empty-text">
            {t('maxExpand.toolbox.software.loading')}
          </span>
        </div>
      ) : softwareItems.length === 0 ? (
        <div className="software-list-empty">
          <span className="software-list-empty-text">
            {t('maxExpand.toolbox.software.empty')}
          </span>
          <span className="software-list-empty-subtitle">
            {t('maxExpand.toolbox.software.subtitle')}
          </span>
          <div className="software-list-empty-actions">
            <button
              className="settings-lyrics-source-btn"
              type="button"
              onClick={loadSoftware}
            >
              {t('maxExpand.toolbox.software.refresh')}
            </button>
            <button
              className="settings-lyrics-source-btn"
              type="button"
              onClick={() => {
                window.api.storeWrite(SETTINGS_OPEN_TAB_STORE_KEY, 'about-feedback').catch(() => {});
                onFeedbackNavigate();
              }}
            >
              {t('maxExpand.toolbox.software.feedback')}
            </button>
          </div>
        </div>
      ) : (
        softwareItems.map((item) => (
          <div key={item.id} className="software-list-card">
            <img
              className="software-list-card-icon"
              src={item.iconUrl}
              alt={item.name}
              draggable={false}
            />
            <div className="software-list-card-info">
              <span className="software-list-card-name">{item.name}</span>
              <span className="software-list-card-desc">{item.description}</span>
            </div>
            <button
              className="settings-lyrics-source-btn"
              type="button"
              onClick={() => window.api?.clipboardOpenUrl(item.url)}
            >
              {t('maxExpand.toolbox.software.download')}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
