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
 * @file AlbumHeader.tsx
 * @description 相册页头部工具栏：标题、计数、排序、筛选、分组、列数、导入、多选。
 * @author 鸡哥
 */

import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COLUMNS, MIN_COLUMNS } from '../types/albumTypes';
import type { AlbumHeaderProps } from '../types/albumTypes';

/**
 * 相册页头部工具栏。
 */
export function AlbumHeader({
  totalCount, sortMode, filterMode, groupMode, columns, selectMode, filteredCount,
  onSortChange, onFilterModeChange, onGroupModeChange, onColumnsChange, onPickFiles, onToggleSelectMode,
}: AlbumHeaderProps): ReactElement {
  const { t } = useTranslation();

  const sortOptions = useMemo<Array<{ value: string; label: string }>>(() => ([
    { value: 'addedDesc', label: t('albumTab.sort.addedDesc') },
    { value: 'addedAsc', label: t('albumTab.sort.addedAsc') },
    { value: 'nameAsc', label: t('albumTab.sort.nameAsc') },
    { value: 'nameDesc', label: t('albumTab.sort.nameDesc') },
    { value: 'durationDesc', label: t('albumTab.sort.durationDesc') },
    { value: 'durationAsc', label: t('albumTab.sort.durationAsc') },
  ]), [t]);

  return (
    <div className="album-header">
      <div className="album-header-main">
        <span className="album-title">{t('albumTab.title')}</span>
        <span className="album-count">
          {t('albumTab.count', { count: totalCount })}
        </span>
      </div>
      <div className="album-header-actions">
        <label className="album-sort">
          <span className="album-sort-label">{t('albumTab.sort.label')}</span>
          <select
            className="album-sort-select"
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label={t('albumTab.sort.label')}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <div className="album-filter-group" role="group" aria-label={t('albumTab.filter.label')}>
          <button
            className={`album-filter-btn${filterMode === 'all' ? ' album-filter-btn--active' : ''}`}
            type="button"
            onClick={() => onFilterModeChange('all')}
          >
            {t('albumTab.filter.all')}
          </button>
          <button
            className={`album-filter-btn${filterMode === 'image' ? ' album-filter-btn--active' : ''}`}
            type="button"
            onClick={() => onFilterModeChange('image')}
          >
            {t('albumTab.filter.image')}
          </button>
          <button
            className={`album-filter-btn${filterMode === 'video' ? ' album-filter-btn--active' : ''}`}
            type="button"
            onClick={() => onFilterModeChange('video')}
          >
            {t('albumTab.filter.video')}
          </button>
        </div>
        <div className="album-filter-group" role="group" aria-label={t('albumTab.group.label')}>
          <button
            className={`album-filter-btn${groupMode === 'none' ? ' album-filter-btn--active' : ''}`}
            type="button"
            onClick={() => onGroupModeChange('none')}
          >
            {t('albumTab.group.none')}
          </button>
          <button
            className={`album-filter-btn${groupMode === 'folder' ? ' album-filter-btn--active' : ''}`}
            type="button"
            onClick={() => onGroupModeChange('folder')}
          >
            {t('albumTab.group.folder')}
          </button>
          <button
            className={`album-filter-btn${groupMode === 'date' ? ' album-filter-btn--active' : ''}`}
            type="button"
            onClick={() => onGroupModeChange('date')}
          >
            {t('albumTab.group.date')}
          </button>
        </div>
        <div className="album-columns" aria-label={t('albumTab.columns.aria')}>
          <button
            className="album-icon-btn"
            type="button"
            onClick={() => onColumnsChange(-1)}
            disabled={columns <= MIN_COLUMNS}
            title={t('albumTab.columns.smaller')}
            aria-label={t('albumTab.columns.smaller')}
          >
            −
          </button>
          <span className="album-columns-value">{columns}</span>
          <button
            className="album-icon-btn"
            type="button"
            onClick={() => onColumnsChange(1)}
            disabled={columns >= MAX_COLUMNS}
            title={t('albumTab.columns.larger')}
            aria-label={t('albumTab.columns.larger')}
          >
            +
          </button>
        </div>
        <button
          className="album-primary-btn"
          type="button"
          onClick={onPickFiles}
          title={t('albumTab.actions.add')}
        >
          {t('albumTab.actions.add')}
        </button>
        <button
          className={`album-text-btn${selectMode ? ' album-text-btn--active' : ''}`}
          type="button"
          onClick={onToggleSelectMode}
          disabled={filteredCount === 0}
          title={t('albumTab.actions.select')}
        >
          {t('albumTab.actions.select')}
        </button>
      </div>
    </div>
  );
}
