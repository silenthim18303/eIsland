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
 * @file FileCompressionToolSection.tsx
 * @description 工具箱文件压缩模块（界面入口）
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FILE_COMPRESSION_PAGES,
  type FileCompressionPageKey,
} from '../config/fileCompressionToolConfig';

interface FileCompressionToolSectionProps {
  fileCompressionPage: FileCompressionPageKey;
  setFileCompressionPage: (page: FileCompressionPageKey) => void;
}

/**
 * 文件压缩模块主视图。
 */
export function FileCompressionToolSection({
  fileCompressionPage,
  setFileCompressionPage,
}: FileCompressionToolSectionProps): ReactElement {
  const { t } = useTranslation();

  const pageLabels: Record<FileCompressionPageKey, string> = {
    imageCompression: t('maxExpand.toolbox.fileCompression.pages.imageCompression'),
  };

  return (
    <div className="settings-app-pages-layout">
      <div className="settings-app-page-main">
        {fileCompressionPage === 'imageCompression' && (
          <div className="settings-file-compression-page-panel" />
        )}
      </div>
      <div className="settings-app-page-dots">
        {FILE_COMPRESSION_PAGES.map((page) => (
          <button
            key={page}
            className={`settings-app-page-dot ${fileCompressionPage === page ? 'active' : ''}`}
            data-label={pageLabels[page]}
            type="button"
            onClick={() => setFileCompressionPage(page)}
            title={pageLabels[page]}
            aria-label={pageLabels[page]}
          />
        ))}
      </div>
    </div>
  );
}
