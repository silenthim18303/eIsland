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
 * @file AlbumMetaPanel.tsx
 * @description 查看器右侧元数据侧栏：基础信息、EXIF 数据、设为灵动岛背景按钮。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { AlbumMetaPanelProps } from '../types/albumTypes';
import { formatBytes, formatDuration, formatTimestamp } from '../utils/albumUtils';

/**
 * 查看器右侧元数据侧栏。
 */
export function AlbumMetaPanel({ activeItem, activeMeta, onSetAsIslandBackground }: AlbumMetaPanelProps): ReactElement {
  const { t } = useTranslation();

  return (
    <aside className="album-meta-panel">
      <div className="album-meta-title">{t('albumTab.meta.title')}</div>
      <ul className="album-meta-list">
        <li className="album-meta-row">
          <span className="album-meta-label">{t('albumTab.meta.name')}</span>
          <span className="album-meta-value" title={activeItem.name}>{activeItem.name}</span>
        </li>
        <li className="album-meta-row">
          <span className="album-meta-label">{t('albumTab.meta.format')}</span>
          <span className="album-meta-value">{activeItem.ext.toUpperCase() || '-'}</span>
        </li>
        <li className="album-meta-row">
          <span className="album-meta-label">{t('albumTab.meta.mediaType')}</span>
          <span className="album-meta-value">{activeItem.mediaType === 'video' ? t('albumTab.meta.mediaTypeVideo') : t('albumTab.meta.mediaTypeImage')}</span>
        </li>
        <li className="album-meta-row">
          <span className="album-meta-label">{t('albumTab.meta.resolution')}</span>
          <span className="album-meta-value">
            {activeMeta?.width && activeMeta?.height
              ? `${activeMeta.width} × ${activeMeta.height}`
              : '-'}
          </span>
        </li>
        <li className="album-meta-row">
          <span className="album-meta-label">{t('albumTab.meta.duration')}</span>
          <span className="album-meta-value">{formatDuration(activeMeta?.durationSec)}</span>
        </li>
        {activeItem.mediaType === 'video' ? (
          <>
            <li className="album-meta-row">
              <span className="album-meta-label">{t('albumTab.meta.codec')}</span>
              <span className="album-meta-value">{activeMeta?.videoCodec || '-'}</span>
            </li>
            <li className="album-meta-row">
              <span className="album-meta-label">{t('albumTab.meta.fps')}</span>
              <span className="album-meta-value">{typeof activeMeta?.fps === 'number' ? `${activeMeta.fps.toFixed(2)} FPS` : '-'}</span>
            </li>
          </>
        ) : null}
        <li className="album-meta-row">
          <span className="album-meta-label">{t('albumTab.meta.size')}</span>
          <span className="album-meta-value">{formatBytes(activeMeta?.sizeBytes)}</span>
        </li>
        <li className="album-meta-row">
          <span className="album-meta-label">{t('albumTab.meta.addedAt')}</span>
          <span className="album-meta-value">{formatTimestamp(activeItem.addedAt)}</span>
        </li>
        <li className="album-meta-row album-meta-row--path">
          <span className="album-meta-label">{t('albumTab.meta.path')}</span>
          <span className="album-meta-value album-meta-path" title={activeItem.path}>{activeItem.path}</span>
        </li>
      </ul>

      {activeItem.mediaType === 'image' && activeMeta?.exif ? (
        <>
          <div className="album-meta-title album-meta-title--sub">{t('albumTab.meta.exifTitle')}</div>
          <ul className="album-meta-list">
            {activeMeta.exif.make ? (
              <li className="album-meta-row">
                <span className="album-meta-label">{t('albumTab.meta.make')}</span>
                <span className="album-meta-value">{activeMeta.exif.make}</span>
              </li>
            ) : null}
            {activeMeta.exif.model ? (
              <li className="album-meta-row">
                <span className="album-meta-label">{t('albumTab.meta.model')}</span>
                <span className="album-meta-value">{activeMeta.exif.model}</span>
              </li>
            ) : null}
            {activeMeta.exif.dateTimeOriginal ? (
              <li className="album-meta-row">
                <span className="album-meta-label">{t('albumTab.meta.dateTimeOriginal')}</span>
                <span className="album-meta-value">{activeMeta.exif.dateTimeOriginal}</span>
              </li>
            ) : null}
            {activeMeta.exif.exposureTime ? (
              <li className="album-meta-row">
                <span className="album-meta-label">{t('albumTab.meta.exposure')}</span>
                <span className="album-meta-value">{activeMeta.exif.exposureTime}</span>
              </li>
            ) : null}
            {activeMeta.exif.fNumber ? (
              <li className="album-meta-row">
                <span className="album-meta-label">{t('albumTab.meta.fNumber')}</span>
                <span className="album-meta-value">f/{activeMeta.exif.fNumber}</span>
              </li>
            ) : null}
            {activeMeta.exif.iso ? (
              <li className="album-meta-row">
                <span className="album-meta-label">{t('albumTab.meta.iso')}</span>
                <span className="album-meta-value">ISO {activeMeta.exif.iso}</span>
              </li>
            ) : null}
            {activeMeta.exif.focalLength ? (
              <li className="album-meta-row">
                <span className="album-meta-label">{t('albumTab.meta.focalLength')}</span>
                <span className="album-meta-value">{activeMeta.exif.focalLength} mm</span>
              </li>
            ) : null}
          </ul>
        </>
      ) : (activeItem.mediaType === 'image' && (activeItem.ext === 'jpg' || activeItem.ext === 'jpeg')) ? (
        <div className="album-meta-empty">{t('albumTab.meta.exifEmpty')}</div>
      ) : null}

      <div className="album-meta-actions">
        <button
          className="album-primary-btn album-meta-apply-btn"
          type="button"
          onClick={() => onSetAsIslandBackground(activeItem)}
          title={t('albumTab.meta.setAsIslandBackground')}
        >
          {t('albumTab.meta.setAsIslandBackground')}
        </button>
      </div>
    </aside>
  );
}
