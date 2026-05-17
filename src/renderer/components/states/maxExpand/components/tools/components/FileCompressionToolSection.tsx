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

import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FILE_COMPRESSION_PAGES,
  type FileCompressionPageKey,
} from '../config/fileCompressionToolConfig';

interface FileCompressionToolSectionProps {
  fileCompressionPage: FileCompressionPageKey;
  setFileCompressionPage: (page: FileCompressionPageKey) => void;
}

interface ImageCompressionResult {
  inputPath: string;
  outputPath: string;
  success: boolean;
  originalBytes: number;
  compressedBytes: number;
  ratio: number;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function getFileName(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || path;
}

/**
 * 文件压缩模块主视图。
 */
export function FileCompressionToolSection({
  fileCompressionPage,
  setFileCompressionPage,
}: FileCompressionToolSectionProps): ReactElement {
  const { t } = useTranslation();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [outputDir, setOutputDir] = useState('');
  const [quality, setQuality] = useState(80);
  const [compressing, setCompressing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [results, setResults] = useState<ImageCompressionResult[]>([]);

  const pageLabels: Record<FileCompressionPageKey, string> = {
    imageCompression: t('maxExpand.toolbox.fileCompression.pages.imageCompression'),
  };

  const successfulCount = useMemo(() => results.filter((item) => item.success).length, [results]);

  const handlePickImages = (): void => {
    window.api.imageCompressionPickImages().then((paths) => {
      if (!paths || paths.length === 0) return;
      setSelectedImages(paths);
      setResults([]);
      setStatusMessage('');
    }).catch(() => {
      setStatusMessage(t('maxExpand.toolbox.fileCompression.messages.pickFailed'));
    });
  };

  const handlePickOutputDir = (): void => {
    window.api.imageCompressionPickOutputDir().then((picked) => {
      if (!picked) return;
      setOutputDir(picked);
    }).catch(() => {
      setStatusMessage(t('maxExpand.toolbox.fileCompression.messages.pickOutputDirFailed'));
    });
  };

  const handleStartCompression = (): void => {
    if (selectedImages.length === 0 || compressing) return;
    setCompressing(true);
    setStatusMessage('');
    setResults([]);
    window.api.imageCompressionStart({
      inputPaths: selectedImages,
      outputDir: outputDir.trim() || undefined,
      quality,
    }).then((result) => {
      if (!result.ok) {
        setStatusMessage(result.message || t('maxExpand.toolbox.fileCompression.messages.startFailed'));
        return;
      }
      const nextResults = result.results || [];
      setResults(nextResults);
      const successCount = nextResults.filter((item) => item.success).length;
      setStatusMessage(
        t('maxExpand.toolbox.fileCompression.messages.done', {
          success: successCount,
          total: nextResults.length,
        }),
      );
    }).catch(() => {
      setStatusMessage(t('maxExpand.toolbox.fileCompression.messages.startFailed'));
    }).finally(() => {
      setCompressing(false);
    });
  };

  const handleOpenPath = (path: string): void => {
    window.api.openInExplorer(path).catch(() => {
      setStatusMessage(t('maxExpand.toolbox.fileCompression.messages.openFolderFailed'));
    });
  };

  return (
    <div className="settings-app-pages-layout">
      <div className="settings-app-page-main">
        {fileCompressionPage === 'imageCompression' && (
          <div className="settings-cards settings-file-compression-page-panel">
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">{t('maxExpand.toolbox.fileCompression.title')}</div>
                <div className="settings-card-subtitle">{t('maxExpand.toolbox.fileCompression.subtitle')}</div>
              </div>
              <div className="settings-card-body">
                <div className="settings-hotkey-row">
                  <button
                    className="settings-lyrics-source-btn"
                    type="button"
                    onClick={handlePickImages}
                  >
                    {t('maxExpand.toolbox.fileCompression.pickImages')}
                  </button>
                  <span className="settings-music-hint">
                    {selectedImages.length > 0
                      ? t('maxExpand.toolbox.fileCompression.selectedCount', { count: selectedImages.length })
                      : t('maxExpand.toolbox.fileCompression.noImages')}
                  </span>
                </div>

                <label className="settings-field">
                  <span className="settings-field-label">{t('maxExpand.toolbox.fileCompression.outputDir')}</span>
                  <div className="settings-hotkey-row download-path-row">
                    <input
                      className="settings-hotkey-input download-save-path-input"
                      type="text"
                      placeholder={t('maxExpand.toolbox.fileCompression.outputDirPlaceholder')}
                      value={outputDir}
                      onChange={(event) => setOutputDir(event.target.value)}
                    />
                    <button
                      className="settings-lyrics-source-btn"
                      type="button"
                      onClick={handlePickOutputDir}
                    >
                      {t('maxExpand.toolbox.fileCompression.pickOutputDir')}
                    </button>
                  </div>
                </label>

                <label className="settings-field">
                  <span className="settings-field-label">
                    {t('maxExpand.toolbox.fileCompression.quality')}: {quality}
                  </span>
                  <input
                    className="settings-slider"
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={quality}
                    onChange={(event) => setQuality(Number(event.target.value))}
                  />
                  <span className="settings-field-hint">{t('maxExpand.toolbox.fileCompression.qualityHint')}</span>
                </label>

                <div className="settings-hotkey-row">
                  <button
                    className={`settings-lyrics-source-btn download-start-btn-full ${compressing || selectedImages.length === 0 ? 'disabled' : ''}`}
                    type="button"
                    disabled={compressing || selectedImages.length === 0}
                    onClick={handleStartCompression}
                  >
                    {compressing
                      ? t('maxExpand.toolbox.fileCompression.compressing')
                      : t('maxExpand.toolbox.fileCompression.startBtn')}
                  </button>
                </div>

                {!!statusMessage && <div className="settings-music-hint">{statusMessage}</div>}
              </div>
            </div>

            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">
                  {t('maxExpand.toolbox.fileCompression.resultsTitle')}
                </div>
                <div className="settings-card-subtitle">
                  {t('maxExpand.toolbox.fileCompression.resultsSubtitle', {
                    success: successfulCount,
                    total: results.length,
                  })}
                </div>
              </div>
              <div className="settings-card-body">
                {selectedImages.length > 0 && (
                  <div className="settings-card-subgroup">
                    <div className="settings-card-subgroup-title">{t('maxExpand.toolbox.fileCompression.pendingListTitle')}</div>
                    <div className="file-compression-path-list">
                      {selectedImages.map((path) => (
                        <div key={path} className="settings-music-hint">{getFileName(path)}</div>
                      ))}
                    </div>
                  </div>
                )}

                {results.length === 0 && (
                  <div className="settings-music-hint">{t('maxExpand.toolbox.fileCompression.resultsEmpty')}</div>
                )}

                {results.map((item) => (
                  <div key={`${item.inputPath}-${item.outputPath}`} className="settings-card-subgroup download-task-card">
                    <div className="download-task-card-header">
                      <div className="settings-card-subgroup-title">{getFileName(item.inputPath)}</div>
                      {item.success && (
                        <button
                          className="settings-lyrics-source-btn"
                          type="button"
                          onClick={() => handleOpenPath(item.outputPath)}
                        >
                          {t('maxExpand.toolbox.fileCompression.openOutput')}
                        </button>
                      )}
                    </div>
                    <div className="settings-music-hint">
                      {item.success
                        ? t('maxExpand.toolbox.fileCompression.resultSuccess', {
                          before: formatBytes(item.originalBytes),
                          after: formatBytes(item.compressedBytes),
                          ratio: `${(item.ratio * 100).toFixed(1)}%`,
                        })
                        : t('maxExpand.toolbox.fileCompression.resultFailed', {
                          reason: item.error || '-',
                        })}
                    </div>
                    {!!item.outputPath && <div className="settings-music-hint">{item.outputPath}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
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
