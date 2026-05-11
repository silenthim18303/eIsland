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
const ICO_SIZES = [16, 32, 64, 128, 256] as const;
type IcoSize = (typeof ICO_SIZES)[number];

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

function estimateBytesFromDataUrl(dataUrl: string): number {
  const idx = dataUrl.indexOf(',');
  if (idx < 0) return 0;
  const b64 = dataUrl.slice(idx + 1);
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

function getMimeFromDataUrl(dataUrl: string): string {
  const match = /^data:([^;]+);base64,/i.exec(dataUrl);
  return match?.[1] ?? 'image/*';
}

function formatAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  if (width <= 0 || height <= 0) return '-';
  const d = gcd(width, height);
  return `${Math.round(width / d)}:${Math.round(height / d)}`;
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
  const [targetIcoSize, setTargetIcoSize] = useState<IcoSize>(32);
  const [converting, setConverting] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultType, setResultType] = useState<'success' | 'error' | ''>('');
  const [resultFileSize, setResultFileSize] = useState<number | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [imgFileSize, setImgFileSize] = useState<number | null>(null);

  const pixelCount = imgWidth > 0 && imgHeight > 0 ? imgWidth * imgHeight : 0;
  const previewMime = previewDataUrl ? getMimeFromDataUrl(previewDataUrl) : '-';

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
        setImgWidth(0);
        setImgHeight(0);
        setImgFileSize(null);
        setPreviewDataUrl('');
        try {
          const dataUrl = await window.api?.loadWallpaperFile?.(picked);
          if (dataUrl) {
            setPreviewDataUrl(dataUrl);
            if (imgFileSize === null) {
              const estimated = estimateBytesFromDataUrl(dataUrl);
              if (estimated > 0) setImgFileSize(estimated);
            }
          }
        } catch { /* ignore */ }
        try {
          const stat = await (window.api as Record<string, unknown> & {
            getFileStat?: (p: string) => Promise<{ size: number } | null>;
          }).getFileStat?.(picked);
          if (stat?.size != null) setImgFileSize(stat.size);
        } catch { /* ignore */ }
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

          {previewDataUrl && (
            <div className="ff-preview-area">
              <div className="ff-preview-thumb">
                <img
                  src={previewDataUrl}
                  alt={fileName}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setImgWidth(img.naturalWidth);
                    setImgHeight(img.naturalHeight);
                  }}
                />
              </div>
              <ul className="album-meta-list ff-meta-list">
                <li className="album-meta-row">
                  <span className="album-meta-label">{t('maxExpand.toolbox.formatFactory.image.meta.name')}</span>
                  <span className="album-meta-value" title={fileName}>{fileName}</span>
                </li>
                <li className="album-meta-row">
                  <span className="album-meta-label">{t('maxExpand.toolbox.formatFactory.image.meta.mediaType')}</span>
                  <span className="album-meta-value">{t('maxExpand.toolbox.formatFactory.image.meta.mediaTypeImage')}</span>
                </li>
                <li className="album-meta-row">
                  <span className="album-meta-label">{t('maxExpand.toolbox.formatFactory.image.meta.mime')}</span>
                  <span className="album-meta-value">{previewMime}</span>
                </li>
                <li className="album-meta-row">
                  <span className="album-meta-label">{t('maxExpand.toolbox.formatFactory.image.meta.format')}</span>
                  <span className="album-meta-value">{sourceExt.toUpperCase()}</span>
                </li>
                {imgWidth > 0 && imgHeight > 0 && (
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('maxExpand.toolbox.formatFactory.image.meta.resolution')}</span>
                    <span className="album-meta-value">{imgWidth} × {imgHeight}</span>
                  </li>
                )}
                {imgFileSize != null && (
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('maxExpand.toolbox.formatFactory.image.meta.size')}</span>
                    <span className="album-meta-value">{formatFileSize(imgFileSize)}</span>
                  </li>
                )}
                {pixelCount > 0 && (
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('maxExpand.toolbox.formatFactory.image.meta.pixels')}</span>
                    <span className="album-meta-value">{pixelCount.toLocaleString()} px</span>
                  </li>
                )}
                {imgWidth > 0 && imgHeight > 0 && (
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('maxExpand.toolbox.formatFactory.image.meta.aspectRatio')}</span>
                    <span className="album-meta-value">{formatAspectRatio(imgWidth, imgHeight)}</span>
                  </li>
                )}
                <li className="album-meta-row">
                  <span className="album-meta-label">{t('maxExpand.toolbox.formatFactory.image.meta.targetFormat')}</span>
                  <span className="album-meta-value">{targetFormat.toUpperCase()}</span>
                </li>
                <li className="album-meta-row">
                  <span className="album-meta-label">{t('maxExpand.toolbox.formatFactory.image.meta.path')}</span>
                  <span className="album-meta-value" title={filePath}>{filePath}</span>
                </li>
              </ul>
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

          {targetFormat === 'ico' && (
            <div className="file-hash-row">
              <span style={{ fontSize: 12, opacity: 0.6, marginRight: 8, whiteSpace: 'nowrap' }}>
                {t('maxExpand.toolbox.formatFactory.image.targetSize')}
              </span>
              <div className="file-hash-algo-group">
                {ICO_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`file-hash-algo-btn ${targetIcoSize === size ? 'active' : ''}`}
                    onClick={() => setTargetIcoSize(size)}
                  >
                    {size}x{size}
                  </button>
                ))}
              </div>
            </div>
          )}

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
