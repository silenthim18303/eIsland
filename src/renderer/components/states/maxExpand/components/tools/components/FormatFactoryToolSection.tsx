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
 * @file FormatFactoryToolSection.tsx
 * @description 工具箱格式工厂模块
 * @author 鸡哥
 */

import { useCallback, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

const IMAGE_FORMATS = ['png', 'jpg', 'webp', 'bmp', 'ico'] as const;
type ImageFormat = (typeof IMAGE_FORMATS)[number];

function getExtension(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const name = parts[parts.length - 1] || '';
  const dotIdx = name.lastIndexOf('.');
  return dotIdx > 0 ? name.slice(dotIdx + 1).toLowerCase() : '';
}

function getFileName(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || filePath;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * 格式工厂模块主视图。
 */
export function FormatFactoryToolSection(): ReactElement {
  const { t } = useTranslation();

  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');
  const [sourceExt, setSourceExt] = useState('');
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
  const [converting, setConverting] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultType, setResultType] = useState<'success' | 'error' | ''>('');
  const [resultFileSize, setResultFileSize] = useState<number | null>(null);

  const handlePickFile = useCallback(async (): Promise<void> => {
    try {
      const picked = await window.api?.pickFileForHash?.();
      if (picked) {
        setFilePath(picked);
        setFileName(getFileName(picked));
        const ext = getExtension(picked);
        setSourceExt(ext);
        setResultMessage('');
        setResultType('');
        setResultFileSize(null);
        if (ext && IMAGE_FORMATS.includes(ext as ImageFormat)) {
          const firstOther = IMAGE_FORMATS.find((f) => f !== ext);
          if (firstOther) setTargetFormat(firstOther);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleConvert = useCallback(async (): Promise<void> => {
    if (!filePath || converting) return;
    setConverting(true);
    setResultMessage('');
    setResultType('');
    setResultFileSize(null);
    try {
      const result = await (window.api as Record<string, unknown> & {
        convertImageFormat?: (src: string, format: string, quality: number) => Promise<{ success: boolean; outputPath?: string; fileSize?: number; error?: string }>;
      }).convertImageFormat?.(filePath, targetFormat, 100);
      if (result?.success) {
        setResultMessage(t('maxExpand.toolbox.formatFactory.image.success', { path: result.outputPath ?? '' }));
        setResultType('success');
        if (result.fileSize) setResultFileSize(result.fileSize);
      } else {
        setResultMessage(result?.error || t('maxExpand.toolbox.formatFactory.image.failed'));
        setResultType('error');
      }
    } catch {
      setResultMessage(t('maxExpand.toolbox.formatFactory.image.failed'));
      setResultType('error');
    } finally {
      setConverting(false);
    }
  }, [filePath, converting, targetFormat, t]);

  return (
    <div className="settings-cards format-factory-panel">
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-title">{t('maxExpand.toolbox.formatFactory.image.title')}</div>
          <div className="settings-card-subtitle">{t('maxExpand.toolbox.formatFactory.image.subtitle')}</div>
        </div>
        <div className="settings-card-body">
          <div className="file-hash-row">
            <button
              type="button"
              className="file-hash-pick-btn"
              onClick={handlePickFile}
            >
              {t('maxExpand.toolbox.formatFactory.image.pickFile')}
            </button>
          </div>

          {fileName && (
            <div className="file-hash-row">
              <span className="file-hash-filename" title={filePath}>
                {fileName}
                {sourceExt && (
                  <span style={{ opacity: 0.5, marginLeft: 6 }}>
                    ({sourceExt.toUpperCase()})
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="file-hash-row">
            <span style={{ fontSize: 12, opacity: 0.6, marginRight: 8, whiteSpace: 'nowrap' }}>
              {t('maxExpand.toolbox.formatFactory.image.targetFormat')}
            </span>
            <div className="file-hash-algo-group">
              {IMAGE_FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  className={`file-hash-algo-btn ${targetFormat === fmt ? 'active' : ''} ${sourceExt === fmt ? 'disabled' : ''}`}
                  disabled={sourceExt === fmt}
                  onClick={() => setTargetFormat(fmt)}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-hotkey-row">
            <button
              className={`settings-lyrics-source-btn download-start-btn-full ${(!filePath || converting || sourceExt === targetFormat) ? 'disabled' : ''}`}
              type="button"
              disabled={!filePath || converting || sourceExt === targetFormat}
              onClick={handleConvert}
            >
              {converting
                ? t('maxExpand.toolbox.formatFactory.image.converting')
                : t('maxExpand.toolbox.formatFactory.image.convertBtn')}
            </button>
          </div>

          {resultMessage && (
            <div className={`file-hash-verify ${resultType === 'success' ? 'match' : 'mismatch'}`}>
              <span>{resultMessage}</span>
              {resultType === 'success' && resultFileSize !== null && (
                <span style={{ opacity: 0.7, marginLeft: 8, fontSize: 11 }}>
                  ({formatFileSize(resultFileSize)})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
